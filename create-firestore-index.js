// Script to create Firestore index for schools collection
// Run this in your browser console when on the admin page

console.log('Creating Firestore index for schools collection...');

// This will trigger the index creation when you first try to query with orderBy
// The error will show you the exact index to create in the Firebase Console

// You can also manually create the index in Firebase Console:
// 1. Go to Firebase Console > Firestore Database > Indexes
// 2. Click "Add Index"
// 3. Collection ID: schools
// 4. Fields: createdAt (Descending)
// 5. Click "Create Index"

// Alternative: Use Firebase CLI to create the index
// firebase deploy --only firestore:indexes

console.log('Index creation instructions logged above.'); 