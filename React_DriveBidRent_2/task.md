# Review System for Rental Cars - Task Breakdown

## Backend Implementation
- [/] Create RentalReview model with schema
- [ ] Create review controller for buyer operations (add, get reviews)
- [ ] Create review controller for seller operations (get reviews)
- [ ] Add review routes to buyer routes
- [ ] Add review routes to seller routes (if needed)

## Frontend - Buyer Side
- [ ] Create ReviewModal component for writing reviews
- [ ] Update buyer RentalDetails.jsx to include review section
- [ ] Add review service functions to buyer.services.js
- [ ] Implement "Write Review" functionality (only for past renters)
- [ ] Implement "Read Reviews" functionality (for all users)

## Frontend - Seller Side
- [ ] Update seller RentalDetails.jsx to display reviews section
- [ ] Add service functions to fetch reviews for seller

## Verification
- [ ] Test review submission as a buyer who has rented
- [ ] Test review visibility on buyer rental details page
- [ ] Test review visibility on seller rental details page
- [ ] Verify non-renters cannot submit reviews
