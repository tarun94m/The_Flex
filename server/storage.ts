import { type User, type InsertUser, type Review, type InsertReview, type Property, type InsertProperty, type ReviewFilters } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Review operations
  getReviews(filters?: ReviewFilters): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  approveReview(id: string, approvedBy: string): Promise<Review | undefined>;
  rejectReview(id: string): Promise<Review | undefined>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  getApprovedReviewsForProperty(propertyId: string): Promise<Review[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reviews: Map<string, Review>;
  private properties: Map<string, Property>;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.properties = new Map();
    
    // Initialize with some sample properties
    this.initializeProperties();
  }

  private async initializeProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        name: "Modern 2BR in Trendy Shoreditch",
        address: "29 Shoreditch Heights, London E1 6JE",
        description: "Experience the best of London living in this beautifully designed 2-bedroom apartment in the heart of Shoreditch.",
        price: 125,
        category: "apartment",
        bedrooms: 2,
        bathrooms: 2,
      },
      {
        name: "Stylish Camden Apartment",
        address: "15 Camden Square, London NW1 9XA",
        description: "A contemporary apartment in the vibrant Camden area with excellent transport links.",
        price: 110,
        category: "apartment",
        bedrooms: 1,
        bathrooms: 1,
      },
      {
        name: "Luxury Notting Hill Studio",
        address: "8 Notting Hill Gardens, London W11 3DF",
        description: "A beautiful studio apartment in prestigious Notting Hill with modern amenities.",
        price: 95,
        category: "studio",
        bedrooms: 1,
        bathrooms: 1,
      },
      {
        name: "Cozy Covent Garden Flat",
        address: "42 Covent Garden Plaza, London WC2E 8RF",
        description: "A charming flat in the heart of Covent Garden, perfect for theater and shopping enthusiasts.",
        price: 140,
        category: "flat",
        bedrooms: 1,
        bathrooms: 1,
      },
      {
        name: "Spacious Kensington House",
        address: "78 Kensington High Street, London W8 4PE",
        description: "A magnificent 3-bedroom house in prestigious Kensington with garden access.",
        price: 200,
        category: "house",
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        name: "Contemporary Canary Wharf Studio",
        address: "12 Canary Wharf Drive, London E14 5AB",
        description: "Modern studio apartment in the financial district with stunning city views.",
        price: 120,
        category: "studio",
        bedrooms: 1,
        bathrooms: 1,
      },
      {
        name: "Historic Greenwich Townhouse",
        address: "25 Greenwich Park Road, London SE10 9LS",
        description: "Beautiful Victorian townhouse near Greenwich Park with period features.",
        price: 180,
        category: "townhouse",
        bedrooms: 4,
        bathrooms: 3,
      },
      {
        name: "Chic Hackney Loft",
        address: "88 Hackney Road, London E2 7QL",
        description: "Industrial-style loft in trendy Hackney with exposed brick and high ceilings.",
        price: 130,
        category: "loft",
        bedrooms: 2,
        bathrooms: 2,
      },
    ];

    for (const property of sampleProperties) {
      await this.createProperty(property);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getReviews(filters?: ReviewFilters): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());

    if (filters) {
      if (filters.property && filters.property !== 'all') {
        reviews = reviews.filter(review => 
          review.listingName.toLowerCase().includes(filters.property!.toLowerCase())
        );
      }

      if (filters.propertyCategory && filters.propertyCategory !== 'all') {
        // Filter by property category - get properties first and match their categories
        const properties = Array.from(this.properties.values());
        const categoryProperties = properties.filter(p => p.category === filters.propertyCategory);
        const propertyIds = categoryProperties.map(p => p.id);
        reviews = reviews.filter(review => 
          propertyIds.includes(review.listingId || '') ||
          categoryProperties.some(p => review.listingName.includes(p.name))
        );
      }

      if (filters.rating && filters.rating !== 'all') {
        const minRating = parseInt(filters.rating.replace('+', '').replace(' Stars', ''));
        reviews = reviews.filter(review => 
          review.rating && review.rating >= minRating
        );
      }

      if (filters.categories && filters.categories.length > 0) {
        reviews = reviews.filter(review => 
          review.reviewCategory?.some(cat => 
            filters.categories!.includes(cat.category)
          )
        );
      }

      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'approved') {
          reviews = reviews.filter(review => review.approved === true);
        } else if (filters.status === 'pending') {
          reviews = reviews.filter(review => review.approved === false && !review.rejected);
        } else if (filters.status === 'rejected') {
          reviews = reviews.filter(review => review.rejected === true);
        }
      }

      if (filters.channel && filters.channel !== 'all') {
        reviews = reviews.filter(review => 
          review.channel.toLowerCase() === filters.channel!.toLowerCase()
        );
      }

      if (filters.type && filters.type !== 'all') {
        reviews = reviews.filter(review => 
          review.type === filters.type
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        reviews = reviews.filter(review => 
          review.publicReview?.toLowerCase().includes(searchTerm) ||
          review.guestName.toLowerCase().includes(searchTerm) ||
          review.listingName.toLowerCase().includes(searchTerm) ||
          review.channel.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        reviews = reviews.filter(review => 
          new Date(review.submittedAt) >= startDate
        );
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        reviews = reviews.filter(review => 
          new Date(review.submittedAt) <= endDate
        );
      }
    }

    return reviews.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getReviewById(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newReview: Review = {
      ...review,
      rating: review.rating || null,
      publicReview: review.publicReview || null,
      reviewCategory: Array.isArray(review.reviewCategory) ? review.reviewCategory : null,
      listingId: review.listingId || null,
      approved: false,
      rejected: false,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
    };
    this.reviews.set(review.id, newReview);
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updatedReview = { ...review, ...updates };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async approveReview(id: string, approvedBy: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updatedReview: Review = {
      ...review,
      approved: true,
      approvedAt: new Date(),
      approvedBy,
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async rejectReview(id: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updatedReview: Review = {
      ...review,
      approved: false,
      rejected: true,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: new Date(),
      rejectedBy: "manager",
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      description: insertProperty.description || null,
      averageRating: 0,
      reviewCount: 0,
      category: insertProperty.category,
      bedrooms: insertProperty.bedrooms || 1,
      bathrooms: insertProperty.bathrooms || 1,
    };
    this.properties.set(id, property);
    return property;
  }

  async getApprovedReviewsForProperty(propertyId: string): Promise<Review[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property) return [];

    const reviews = Array.from(this.reviews.values());
    return reviews.filter(review => 
      review.approved === true && 
      review.listingName.toLowerCase().includes(property.name.toLowerCase())
    );
  }
}

export const storage = new MemStorage();
