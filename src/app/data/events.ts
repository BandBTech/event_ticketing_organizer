export const events = [
  {
    id: "1",
    title: "Kathmandu Music Festival 2025",
    date: "October 20, 2025",
    time: "7:00 PM",
    location: "Kathmandu Durbar Square",
    venue_name: "Dasharath Rangashala",
    address: "Tripureswor, Kathmandu 44600, Nepal",
    capacity: 10000,
    price:100,
    timezone: "NPT (UTC+5:45)",
    start_date: "2025-10-20T19:00:00",
    end_date: "2025-10-21T02:00:00",
    status: "LIVE",
    tiers: [
      {
        id: "1",
        tier_name: "General Admission",
        price: 2999,
        quantity: 8000,
        gst: 13,
        sales_start: "2024-01-01T00:00:00",
        sales_end: "2025-10-19T23:59:59"
      },
      {
        id: "2",
        tier_name: "VIP",
        price: 5999,
        quantity: 2000,
        gst: 13,
        sales_start: "2024-01-01T00:00:00",
        sales_end: "2025-10-19T23:59:59"
      }
    ],
    tags: ["Music", "Concert", "Festival", "Live Performance"],
    description: "Experience the biggest music festival in Nepal with international and local artists. Featuring top bands, solo artists, and cultural performances in the heart of Kathmandu.",
    banner_image: "/kat.jpg"
  },
  {
    id: "2",
    title: "Copenhagen Tech Summit 2025",
    date: "November 10, 2025",
    time: "9:00 AM",
    location: "Copenhagen, Denmark",
    venue_name: "Royal Arena",
    address: "Ørestads Boulevard 55, 2300 København, Denmark",
    capacity: 16000,
    price:100,
    timezone: "CET (UTC+1)",
    start_date: "2025-11-10T09:00:00",
    end_date: "2025-11-12T18:00:00",
    status: "UPCOMING",
    tiers: [
      {
        id: "1",
        tier_name: "Standard Pass",
        price: 4999,
        quantity: 12000,
        gst: 25,
        sales_start: "2024-06-01T00:00:00",
        sales_end: "2025-11-09T23:59:59"
      },
      {
        id: "2",
        tier_name: "VIP Pass",
        price: 9999,
        quantity: 3000,
        gst: 25,
        sales_start: "2024-06-01T00:00:00",
        sales_end: "2025-11-09T23:59:59"
      },
      {
        id: "3",
        tier_name: "Student Pass",
        price: 2499,
        quantity: 1000,
        gst: 25,
        sales_start: "2024-06-01T00:00:00",
        sales_end: "2025-11-09T23:59:59"
      }
    ],
    tags: ["Technology", "Innovation", "Startups", "AI", "Networking"],
    description: "A gathering of innovators, entrepreneurs, and tech leaders from around the globe. Featuring keynote speeches, workshops, and networking opportunities.",
    banner_image: "/cph.jpg"
  },
  {
    id: "3",
    title: "Paris Fashion Week Gala 2026",
    date: "March 5, 2026",
    time: "6:30 PM",
    location: "Paris, France",
    venue_name: "Eiffel Tower Pavilion",
    address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    capacity: 500,
    price:100,
    timezone: "CET (UTC+1)",
    start_date: "2026-03-05T18:30:00",
    end_date: "2026-03-05T23:30:00",
    status: "SOLD OUT",
    tiers: [
      {
        id: "1",
        tier_name: "Gala Ticket",
        price: 24999,
        quantity: 500,
        gst: 20,
        sales_start: "2025-01-01T00:00:00",
        sales_end: "2025-12-31T23:59:59"
      }
    ],
    tags: ["Fashion", "Luxury", "Design", "Gala", "Exclusive"],
    description: "An exclusive evening featuring top designers and models from across the world. Red carpet event with celebrity guests and haute couture presentations.",
    banner_image: "/nep.jpg"
  },
  {
    id: "4",
    title: "Pokhara Adventure Fest 2025",
    date: "May 15, 2025",
    time: "8:00 AM",
    location: "Pokhara, Nepal",
    venue_name: "Lakeside Ground",
    address: "Lakeside, Pokhara 33700, Nepal",
    capacity: 5000,
    price:100,
    timezone: "NPT (UTC+5:45)",
    start_date: "2025-05-15T08:00:00",
    end_date: "2025-05-17T22:00:00",
    status: "ON SALE",
    tiers: [
      {
        id: "1",
        tier_name: "Weekend Pass",
        price: 1999,
        quantity: 4000,
        gst: 13,
        sales_start: "2024-03-01T00:00:00",
        sales_end: "2025-05-14T23:59:59"
      },
      {
        id: "2",
        tier_name: "Single Day",
        price: 899,
        quantity: 1000,
        gst: 13,
        sales_start: "2024-03-01T00:00:00",
        sales_end: "2025-05-14T23:59:59"
      }
    ],
    tags: ["Adventure", "Sports", "Outdoor", "Festival", "Nature"],
    description: "Three days of adventure sports, live music, and outdoor activities in the beautiful city of Pokhara. Paragliding, hiking, and cultural experiences.",
    banner_image: "/kat.jpg"
  }
];

export const users = [
  {
    id: "1",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"Manager",
    contact:"+45 12345678",
    status:"Active"
  },
   {
    id: "1",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"Manager",
    contact:"+45 12345678",
    status:"Inactive"
  },
   {
    id: "2",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"staff",
    contact:"+45 12345678",
    status:"Active"
  },
   {
    id: "3",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"staff",
    contact:"+45 12345678",
    status:"active"
  },
   {
    id: "4",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"staff",
    contact:"+45 12345678",
    status:"active"
  },
   {
    id: "5",
    name:" Chong Wei Jie",
    email: "Chongwei@gmail.com",
    role:"staff",
    contact:"+45 12345678",
    status:"inactive"
  },
];
