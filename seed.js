const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/lost-found-simple', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
});

const Item = mongoose.model('Item', {
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  itemName: String,
  category: String,
  description: String,
  location: String,
  date: Date,
  contactName: String,
  contactPhone: String,
  contactEmail: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

async function seed() {
  await User.deleteMany({});
  await Item.deleteMany({});
  
  const password = await bcrypt.hash('password123', 8);
  
  const users = await User.create([
    { name: 'John Doe', email: 'john@example.com', password, phone: '1234567890' },
    { name: 'Jane Smith', email: 'jane@example.com', password, phone: '9876543210' },
    { name: 'Mike Johnson', email: 'mike@example.com', password, phone: '5551234567' },
    { name: 'Sarah Williams', email: 'sarah@example.com', password, phone: '5559876543' },
  ]);
  
  await Item.create([
    {
      userId: users[0]._id,
      type: 'lost',
      itemName: 'iPhone 13 Pro',
      category: 'Electronics',
      description: 'Black iPhone 13 Pro with blue protective case. Has a small crack on the bottom right corner. Contains important photos and work documents.',
      location: 'Main Library, 2nd Floor Study Area',
      date: new Date('2024-02-20'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'found',
      itemName: 'Black Leather Wallet',
      category: 'Accessories',
      description: 'Black leather wallet containing ID cards, credit cards, and some cash. Name on ID starts with "R". Found on table near window.',
      location: 'Student Cafeteria, Table 15',
      date: new Date('2024-02-22'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
    {
      userId: users[0]._id,
      type: 'lost',
      itemName: 'Toyota Car Keys',
      category: 'Keys',
      description: 'Toyota car keys with red keychain that says "Best Dad". Small flashlight attached. Very urgent!',
      location: 'Parking Lot B, Near Main Entrance',
      date: new Date('2024-02-21'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'found',
      itemName: 'Student ID Card',
      category: 'Documents',
      description: 'Student ID card found on the floor. Photo shows male student with glasses. ID number starts with ST2024.',
      location: 'Computer Lab, Building 3',
      date: new Date('2024-02-23'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
    {
      userId: users[0]._id,
      type: 'lost',
      itemName: 'Blue JanSport Backpack',
      category: 'Bags',
      description: 'Blue JanSport backpack with laptop inside (Dell XPS 15). Has a small tear on the front pocket. Contains textbooks and notebooks.',
      location: 'Lecture Hall 5, Front Row',
      date: new Date('2024-02-19'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'found',
      itemName: 'Apple AirPods Pro',
      category: 'Electronics',
      description: 'White Apple AirPods Pro in charging case. Found in locker room. Case has a small scratch on the back.',
      location: 'University Gym, Mens Locker Room',
      date: new Date('2024-02-24'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
    {
      userId: users[0]._id,
      type: 'lost',
      itemName: 'Prescription Glasses',
      category: 'Accessories',
      description: 'Black framed prescription glasses in brown leather case. Lost in cafeteria area during lunch hour.',
      location: 'Main Cafeteria',
      date: new Date('2024-02-22'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'found',
      itemName: 'Chemistry Textbook',
      category: 'Books',
      description: 'Organic Chemistry 5th Edition textbook with notes and highlights inside. Name written on first page.',
      location: 'Science Building, Room 301',
      date: new Date('2024-02-23'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
    {
      userId: users[0]._id,
      type: 'lost',
      itemName: 'Samsung Galaxy Watch',
      category: 'Electronics',
      description: 'Samsung Galaxy Watch 4 (black) with sport band. Contains fitness data and important notifications.',
      location: 'Sports Complex, Near Basketball Court',
      date: new Date('2024-02-21'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'found',
      itemName: 'House Keys',
      category: 'Keys',
      description: 'Set of 3 house keys on a Manchester United keychain. Found near parking area.',
      location: 'Parking Lot C',
      date: new Date('2024-02-23'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
    {
      userId: users[2]._id,
      type: 'lost',
      itemName: 'Brown Leather Jacket',
      category: 'Clothing',
      description: 'Brown leather jacket (size M) with inside pocket containing wireless earbuds. Lost in lecture hall.',
      location: 'Lecture Hall 3',
      date: new Date('2024-02-20'),
      contactName: 'Mike Johnson',
      contactPhone: '5551234567',
      contactEmail: 'mike@example.com',
    },
    {
      userId: users[3]._id,
      type: 'found',
      itemName: 'Water Bottle',
      category: 'Others',
      description: 'Stainless steel Hydro Flask water bottle (blue) with stickers. Found in the gym.',
      location: 'University Gym',
      date: new Date('2024-02-24'),
      contactName: 'Sarah Williams',
      contactPhone: '5559876543',
      contactEmail: 'sarah@example.com',
    },
    {
      userId: users[2]._id,
      type: 'found',
      itemName: 'USB Flash Drive',
      category: 'Electronics',
      description: '32GB Kingston USB flash drive containing academic files. Found plugged into computer.',
      location: 'Computer Lab, Station 12',
      date: new Date('2024-02-25'),
      contactName: 'Mike Johnson',
      contactPhone: '5551234567',
      contactEmail: 'mike@example.com',
    },
    {
      userId: users[3]._id,
      type: 'lost',
      itemName: 'Red Umbrella',
      category: 'Others',
      description: 'Red automatic umbrella with wooden handle. Lost during rainy day last week.',
      location: 'Building A, Main Entrance',
      date: new Date('2024-02-17'),
      contactName: 'Sarah Williams',
      contactPhone: '5559876543',
      contactEmail: 'sarah@example.com',
    },
    {
      userId: users[2]._id,
      type: 'lost',
      itemName: 'Notebook',
      category: 'Books',
      description: 'Black Moleskine notebook with class notes and important sketches. Name on first page.',
      location: 'Art Studio, Room 205',
      date: new Date('2024-02-18'),
      contactName: 'Mike Johnson',
      contactPhone: '5551234567',
      contactEmail: 'mike@example.com',
    },
    {
      userId: users[3]._id,
      type: 'found',
      itemName: 'Gold Bracelet',
      category: 'Accessories',
      description: 'Gold bracelet with small diamonds. Found in ladies restroom. Seems valuable.',
      location: 'Main Building, 3rd Floor Restroom',
      date: new Date('2024-02-26'),
      contactName: 'Sarah Williams',
      contactPhone: '5559876543',
      contactEmail: 'sarah@example.com',
    },
    {
      userId: users[0]._id,
      type: 'found',
      itemName: 'Tablet Charger',
      category: 'Electronics',
      description: 'iPad charging cable and adapter. Found under desk in library.',
      location: 'Main Library, Study Room 4',
      date: new Date('2024-02-25'),
      contactName: 'John Doe',
      contactPhone: '1234567890',
      contactEmail: 'john@example.com',
    },
    {
      userId: users[1]._id,
      type: 'lost',
      itemName: 'Green Scarf',
      category: 'Clothing',
      description: 'Green wool scarf, hand-knitted. Sentimental value. Last seen in cafeteria.',
      location: 'Student Cafeteria',
      date: new Date('2024-02-24'),
      contactName: 'Jane Smith',
      contactPhone: '9876543210',
      contactEmail: 'jane@example.com',
    },
  ]);
  
  const itemCount = await Item.countDocuments();
  const lostCount = await Item.countDocuments({ type: 'lost' });
  const foundCount = await Item.countDocuments({ type: 'found' });
  
  console.log('✅ Sample data created!');
  console.log('');
  console.log('📊 Statistics:');
  console.log(`   Total Items: ${itemCount}`);
  console.log(`   Lost Items: ${lostCount}`);
  console.log(`   Found Items: ${foundCount}`);
  console.log(`   Users: ${users.length}`);
  console.log('');
  console.log('🔑 Login Credentials (password: password123):');
  users.forEach(user => {
    console.log(`   📧 ${user.email}`);
  });
  console.log('');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
