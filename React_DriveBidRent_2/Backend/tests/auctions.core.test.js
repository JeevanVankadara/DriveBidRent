import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockAuctionFind = jest.fn();
const mockAuctionFindOne = jest.fn();
const mockAuctionFindById = jest.fn();

const mockBidFind = jest.fn();
const mockBidFindOne = jest.fn();
const mockBidSave = jest.fn();

const mockPurchaseFindOne = jest.fn();
const mockRedisGet = jest.fn();
const mockRedisSetEx = jest.fn();

const MockAuctionBid = jest.fn(function MockAuctionBid(data) {
  Object.assign(this, data);
  this.save = mockBidSave;
});
MockAuctionBid.find = mockBidFind;
MockAuctionBid.findOne = mockBidFindOne;

jest.unstable_mockModule('../models/AuctionRequest.js', () => ({
  default: {
    find: mockAuctionFind,
    findOne: mockAuctionFindOne,
    findById: mockAuctionFindById,
  },
}));

jest.unstable_mockModule('../models/AuctionBid.js', () => ({
  default: MockAuctionBid,
}));

jest.unstable_mockModule('../models/Purchase.js', () => ({
  default: {
    findOne: mockPurchaseFindOne,
  },
}));

jest.unstable_mockModule('../models/AuctionCost.js', () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule('../utils/redisClient.js', () => ({
  default: {
    isReady: true,
    get: mockRedisGet,
    setEx: mockRedisSetEx,
  },
}));

const {
  getAuctions,
  getSingleAuction,
  placeBid,
} = await import('../controllers/buyer/auctions.controller.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const findChain = (resolved) => ({
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(resolved),
});

// getSingleAuction loads the last few bids as
// find().sort().limit().populate().lean() — note the extra .limit().
const recentBidsChain = (resolved) => ({
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(resolved),
});

describe('buyer auctions core features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRedisGet.mockResolvedValue(null);
    mockRedisSetEx.mockResolvedValue('OK');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAuctions', () => {
    it('returns cached data when redis has value', async () => {
      mockRedisGet.mockResolvedValue(JSON.stringify({ auctions: [{ _id: 'a1' }] }));
      const req = { query: {} };
      const res = createRes();

      await getAuctions(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Auctions fetched successfully (Cached)' })
      );
      expect(mockAuctionFind).not.toHaveBeenCalled();
    });

    it('fetches auctions and current bids when not cached', async () => {
      const auctions = [{ _id: 'a1', startingBid: 100000 }, { _id: 'a2', startingBid: 50000 }];
      mockAuctionFind.mockReturnValue(findChain(auctions));
      mockBidFind.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ auctionId: 'a1', bidAmount: 120000 }]),
      });
      const req = { query: { condition: 'good' } };
      const res = createRes();

      await getAuctions(req, res);

      expect(mockAuctionFind).toHaveBeenCalledTimes(1);
      expect(mockBidFind).toHaveBeenCalledTimes(1);
      expect(mockRedisSetEx).toHaveBeenCalledTimes(1);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.auctions[0].currentHighestBid).toBe(120000);
      expect(payload.data.auctions[1].currentHighestBid).toBe(50000);
    });

    it('applies search and price filters in query', async () => {
      mockAuctionFind.mockReturnValue(findChain([]));
      const req = {
        query: {
          search: 'swift',
          minPrice: '10000',
          maxPrice: '50000',
          fuelType: 'petrol',
          transmission: 'manual',
        },
      };
      const res = createRes();

      await getAuctions(req, res);

      const queryArg = mockAuctionFind.mock.calls[0][0];
      expect(queryArg.$text).toEqual({ $search: 'swift' });
      expect(queryArg.startingBid.$gte).toBe(10000);
      expect(queryArg.startingBid.$lte).toBe(50000);
      expect(queryArg.fuelType).toBe('petrol');
      expect(queryArg.transmission).toBe('manual');
    });

    it('returns 500 on unexpected errors', async () => {
      mockAuctionFind.mockImplementation(() => {
        throw new Error('db error');
      });
      const req = { query: {} };
      const res = createRes();

      await getAuctions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('getSingleAuction', () => {
    it('returns 400 when id is missing', async () => {
      const req = { params: {}, user: { _id: 'u1' } };
      const res = createRes();

      await getSingleAuction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when auction not found', async () => {
      mockAuctionFindOne.mockReturnValue(findChain(null));
      const req = { params: { id: 'a1' }, user: { _id: 'u1' } };
      const res = createRes();

      await getSingleAuction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns auction details with bidder ownership false', async () => {
      mockAuctionFindOne.mockReturnValue(findChain({ _id: 'a1', sellerId: { _id: 's1' } }));
      mockBidFindOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ buyerId: 'u2', bidAmount: 130000 }),
      });
      // The endpoint also loads the last few bids for the live auction room:
      // find().sort().limit().populate().lean()
      mockBidFind.mockReturnValue(recentBidsChain([]));

      const req = { params: { id: 'a1' }, user: { _id: 'u1' } };
      const res = createRes();

      await getSingleAuction(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ isCurrentBidder: false }),
        })
      );
    });

    it('returns the recent bids with each bidder full name', async () => {
      mockAuctionFindOne.mockReturnValue(findChain({ _id: 'a1', sellerId: { _id: 's1' } }));
      mockBidFindOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ buyerId: 'u2', bidAmount: 130000 }),
      });
      mockBidFind.mockReturnValue(
        recentBidsChain([
          { _id: 'b1', bidAmount: 130000, bidTime: '2026-01-01T10:00:00Z', buyerId: { _id: 'u2', firstName: 'Buyer', lastName: 'Two' } },
          { _id: 'b2', bidAmount: 128000, bidTime: '2026-01-01T09:59:00Z', buyerId: { _id: 'u1', firstName: 'Buyer', lastName: 'One' } },
          // a bid whose buyer was deleted must not blow up the response
          { _id: 'b3', bidAmount: 126000, bidTime: '2026-01-01T09:58:00Z', buyerId: null },
        ])
      );

      const req = { params: { id: 'a1' }, user: { _id: 'u1' } };
      const res = createRes();

      await getSingleAuction(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data.recentBids).toEqual([
        expect.objectContaining({ bidAmount: 130000, bidderName: 'Buyer Two' }),
        expect.objectContaining({ bidAmount: 128000, bidderName: 'Buyer One' }),
        expect.objectContaining({ bidAmount: 126000, bidderName: 'Anonymous' }),
      ]);
    });
  });

  describe('placeBid', () => {
    const baseReq = () => ({
      body: { auctionId: 'a1', bidAmount: '120000' },
      user: { _id: 'u1' },
      app: { get: jest.fn().mockReturnValue(null) },
    });

    it('rejects when required fields are missing', async () => {
      const req = { ...baseReq(), body: { auctionId: '', bidAmount: '' } };
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Auction ID and bid amount are required' }));
    });

    it('rejects invalid bid amount', async () => {
      const req = { ...baseReq(), body: { auctionId: 'a1', bidAmount: '-10' } };
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid bid amount' }));
    });

    it('returns 404 when auction does not exist', async () => {
      mockAuctionFindById.mockResolvedValue(null);
      const req = baseReq();
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('rejects bid when auction is inactive', async () => {
      mockAuctionFindById.mockResolvedValue({ started_auction: 'no', auction_stopped: false });
      const req = baseReq();
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Auction is not active or has been stopped' }));
    });

    it('rejects when same buyer already has current bid', async () => {
      mockAuctionFindById.mockResolvedValue({ started_auction: 'yes', auction_stopped: false });
      mockBidFindOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ buyerId: 'u1', bidAmount: 100000 }),
      });
      const req = baseReq();
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'You already have the current bid' }));
    });

    it('rejects bid below min increment from current bid', async () => {
      mockAuctionFindById.mockResolvedValue({ started_auction: 'yes', auction_stopped: false, startingBid: 100000 });
      mockBidFindOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ buyerId: 'u2', bidAmount: 120000 }),
      });
      const req = { ...baseReq(), body: { auctionId: 'a1', bidAmount: '121000' } };
      const res = createRes();

      await placeBid(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Your bid must be at least') }));
    });

    it('places a valid bid successfully', async () => {
      mockAuctionFindById.mockResolvedValue({
        _id: 'a1',
        sellerId: 's1',
        started_auction: 'yes',
        auction_stopped: false,
        startingBid: 100000,
      });
      mockBidFindOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ buyerId: 'u2', bidAmount: 120000 }),
      });
      mockBidSave.mockResolvedValue(true);

      const req = { ...baseReq(), body: { auctionId: 'a1', bidAmount: '125000' } };
      const res = createRes();

      await placeBid(req, res);

      expect(MockAuctionBid).toHaveBeenCalledTimes(1);
      expect(mockBidSave).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Bid placed successfully' }));
    });
  });
});
