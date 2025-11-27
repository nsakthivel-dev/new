// Firebase configuration and initialization template
// Copy this file to firebase.ts and replace with your actual Firebase config
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Collection reference
const contentCollection = collection(db, "adminContent");

// Functions to interact with Firebase
export const firebaseService = {
  // Add content to Firestore
  addContent: async (data: { title: string; content: string }) => {
    try {
      const docRef = await addDoc(contentCollection, {
        ...data,
        createdAt: new Date(),
      });
      return { id: docRef.id, ...data, createdAt: new Date() };
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  },

  // Get all content from Firestore
  getContent: async () => {
    try {
      const querySnapshot = await getDocs(contentCollection);
      const contentList: any[] = [];
      querySnapshot.forEach((doc) => {
        contentList.push({ id: doc.id, ...doc.data() });
      });
      return contentList;
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  },

  // Delete content from Firestore
  deleteContent: async (id: string) => {
    try {
      await deleteDoc(doc(db, "adminContent", id));
      return id;
    } catch (error) {
      console.error("Error deleting document: ", error);
      throw error;
    }
  },
};

export { db };