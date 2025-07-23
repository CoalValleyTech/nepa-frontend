import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  limit,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';

export interface School {
  id?: string;
  name: string;
  location: string;
  logoUrl?: string;
  sports?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ScheduleEntry {
  location: string;
  time: string;
  opponent: string;
  status?: string;
  score?: any;
  url?: string;
}

export interface Article {
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  category: string;
  image?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Schools Collection
const SCHOOLS_COLLECTION = 'schools';

// Add a new school
export const addSchool = async (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>, logoFile?: File): Promise<string> => {
  try {
    console.log('Starting addSchool function with data:', schoolData);
    let logoUrl = '';
    
    // Upload logo if provided
    if (logoFile) {
      console.log('Uploading logo file:', logoFile.name);
      const logoRef = ref(storage, `school-logos/${Date.now()}-${logoFile.name}`);
      console.log('Logo storage reference created');
      
      const uploadResult = await uploadBytes(logoRef, logoFile);
      console.log('Logo uploaded successfully');
      
      logoUrl = await getDownloadURL(uploadResult.ref);
      console.log('Logo download URL obtained:', logoUrl);
    }

    // Add to Firestore
    const firestorePayload = {
      ...schoolData,
      logoUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    console.log('=== FIRESTORE PAYLOAD ===\n' + JSON.stringify(firestorePayload, null, 2));
    const docRef = await addDoc(collection(db, SCHOOLS_COLLECTION), firestorePayload);

    console.log('School added to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error in addSchool function:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service is currently unavailable. Please try again.');
    } else if (error.code === 'network-error') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(`Failed to add school: ${error.message}`);
  }
};

// Get all schools with optimized query
export const getSchools = async (): Promise<School[]> => {
  try {
    console.log('Starting getSchools function');
    
    // First try with orderBy, if it fails, fall back to simple query
    let querySnapshot;
    try {
      const q = query(collection(db, SCHOOLS_COLLECTION), orderBy('createdAt', 'desc'));
      console.log('Query created with orderBy');
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      console.warn('Index error, falling back to simple query:', indexError);
      // Fallback to simple query without orderBy
      const q = query(collection(db, SCHOOLS_COLLECTION));
      querySnapshot = await getDocs(q);
    }
    
    console.log('Query executed, got', querySnapshot.docs.length, 'documents');
    
    const schools = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as School[];
    
    // Sort manually if orderBy failed
    schools.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
    });
    
    console.log('Schools processed:', schools);
    return schools;
  } catch (error: any) {
    console.error('Error in getSchools function:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service is currently unavailable. Please try again.');
    } else if (error.code === 'network-error') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(`Failed to fetch schools: ${error.message}`);
  }
};

// Get schools with pagination for better performance
export const getSchoolsPaginated = async (limitCount: number = 10): Promise<School[]> => {
  try {
    console.log('Starting getSchoolsPaginated function with limit:', limitCount);
    
    const q = query(
      collection(db, SCHOOLS_COLLECTION), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query executed, got', querySnapshot.docs.length, 'documents');
    
    const schools = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as School[];
    
    console.log('Schools processed:', schools);
    return schools;
  } catch (error: any) {
    console.error('Error in getSchoolsPaginated function:', error);
    throw new Error(`Failed to fetch schools: ${error.message}`);
  }
};

// Delete a school
export const deleteSchool = async (schoolId: string, logoUrl?: string): Promise<void> => {
  try {
    console.log('Starting deleteSchool function for ID:', schoolId);
    
    // Delete logo from storage if it exists
    if (logoUrl) {
      console.log('Deleting logo from storage:', logoUrl);
      const logoRef = ref(storage, logoUrl);
      try {
        await deleteObject(logoRef);
        console.log('Logo deleted from storage');
      } catch (error) {
        console.warn('Logo not found in storage:', error);
      }
    }

    // Delete from Firestore
    console.log('Deleting from Firestore');
    await deleteDoc(doc(db, SCHOOLS_COLLECTION, schoolId));
    console.log('School deleted from Firestore');
  } catch (error: any) {
    console.error('Error in deleteSchool function:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    } else if (error.code === 'not-found') {
      throw new Error('School not found. It may have already been deleted.');
    }
    
    throw new Error(`Failed to delete school: ${error.message}`);
  }
};

// Update a school
export const updateSchool = async (
  schoolId: string, 
  updates: Partial<School>, 
  newLogoFile?: File
): Promise<void> => {
  try {
    console.log('Starting updateSchool function for ID:', schoolId);
    let logoUrl = updates.logoUrl || '';

    // Upload new logo if provided
    if (newLogoFile) {
      console.log('Uploading new logo file:', newLogoFile.name);
      const logoRef = ref(storage, `school-logos/${Date.now()}-${newLogoFile.name}`);
      const uploadResult = await uploadBytes(logoRef, newLogoFile);
      logoUrl = await getDownloadURL(uploadResult.ref);
      console.log('New logo uploaded and URL obtained');
    }

    // Update in Firestore
    console.log('Updating in Firestore');
    await updateDoc(doc(db, SCHOOLS_COLLECTION, schoolId), {
      ...updates,
      logoUrl,
      updatedAt: serverTimestamp()
    });
    console.log('School updated in Firestore');
  } catch (error: any) {
    console.error('Error in updateSchool function:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    } else if (error.code === 'not-found') {
      throw new Error('School not found. It may have been deleted.');
    }
    
    throw new Error(`Failed to update school: ${error.message}`);
  }
}; 

export const addSportToSchool = async (schoolId: string, sport: string): Promise<void> => {
  try {
    const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);
    await updateDoc(schoolRef, {
      sports: arrayUnion(sport),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error('Failed to add sport to school: ' + error.message);
  }
}; 

export const addScheduleToGlobal = async (
  schoolId: string | undefined,
  schoolName: string,
  sport: string,
  entry: ScheduleEntry
): Promise<void> => {
  try {
    console.log('addScheduleToGlobal called with:', { schoolId, schoolName, sport, entry });
    
    // Create the base document data
    const scheduleData: any = {
      schoolName,
      sport,
      location: entry.location,
      time: entry.time,
      opponent: entry.opponent,
      createdAt: serverTimestamp(),
    };
    
    // Add optional fields only if they have values
    if (entry.status) {
      scheduleData.status = entry.status;
    }
    if (entry.score) {
      scheduleData.score = entry.score;
    }
    if (entry.url) {
      scheduleData.url = entry.url;
    }
    
    // Only add schoolId if it's provided and not undefined
    if (schoolId && schoolId !== undefined) {
      scheduleData.schoolId = schoolId;
    }
    
    console.log('Final scheduleData being saved:', scheduleData);
    
    await addDoc(collection(db, 'schedules'), scheduleData);
  } catch (error: any) {
    console.error('Error in addScheduleToGlobal:', error);
    throw new Error('Failed to add schedule to global collection: ' + error.message);
  }
};

export const addScheduleToSchool = async (
  schoolId: string,
  sport: string,
  entries: ScheduleEntry[],
  schoolName?: string
): Promise<void> => {
  try {
    const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);
    // Use a map field 'schedules' where each key is a sport and value is an array of entries
    await updateDoc(schoolRef, {
      [`schedules.${sport}`]: arrayUnion(...entries),
      updatedAt: serverTimestamp(),
    });
    // Also add to global schedules collection
    if (schoolName) {
      for (const entry of entries) {
        await addScheduleToGlobal(schoolId, schoolName, sport, entry);
      }
    }
  } catch (error: any) {
    throw new Error('Failed to add schedule to school: ' + error.message);
  }
}; 

export const getGlobalSchedules = async (sport?: string): Promise<any[]> => {
  try {
    let q;
    if (sport) {
      q = query(collection(db, 'schedules'), where('sport', '==', sport));
    } else {
      q = query(collection(db, 'schedules'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error('Failed to fetch global schedules: ' + error.message);
  }
}; 

export const deleteAllGlobalSchedules = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'schedules'));
    const batchDeletes: Promise<void>[] = [];
    querySnapshot.forEach(docSnap => {
      batchDeletes.push(deleteDoc(doc(db, 'schedules', docSnap.id)));
    });
    await Promise.all(batchDeletes);
  } catch (error: any) {
    throw new Error('Failed to delete all global schedules: ' + error.message);
  }
}; 

/**
 * Delete a single schedule/game from both the school's schedules.{sport} array and the global schedules collection.
 * @param schoolId The school document ID
 * @param sport The sport name
 * @param entry The schedule entry to remove (location, time, opponent)
 * @param globalScheduleId (optional) The document ID in the global schedules collection
 */
export const deleteScheduleEntry = async (
  schoolId: string,
  sport: string,
  entry: ScheduleEntry,
  globalScheduleId?: string
): Promise<void> => {
  try {
    // Remove from the school's schedules.{sport} array
    const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);
    await updateDoc(schoolRef, {
      [`schedules.${sport}`]: arrayRemove(entry),
      updatedAt: serverTimestamp(),
    });
    // Remove from global schedules collection if docId provided
    if (globalScheduleId) {
      await deleteDoc(doc(db, 'schedules', globalScheduleId));
    } else {
      // If no docId, try to find and delete by matching fields (less efficient)
      const q = query(
        collection(db, 'schedules'),
        where('schoolId', '==', schoolId),
        where('sport', '==', sport),
        where('location', '==', entry.location),
        where('time', '==', entry.time),
        where('opponent', '==', entry.opponent)
      );
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'schedules', docSnap.id));
      }
    }
  } catch (error: any) {
    throw new Error('Failed to delete schedule entry: ' + error.message);
  }
}; 

/**
 * Update a specific schedule entry in a school's schedules.{sport} array.
 * Removes the old entry and adds the updated one (with score and status).
 */
export const updateSchoolScheduleEntry = async (
  schoolId: string,
  sport: string,
  oldEntry: ScheduleEntry,
  updatedEntry: ScheduleEntry
): Promise<void> => {
  try {
    const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);
    // Remove old entry
    await updateDoc(schoolRef, {
      [`schedules.${sport}`]: arrayRemove(oldEntry),
    });
    // Add updated entry
    await updateDoc(schoolRef, {
      [`schedules.${sport}`]: arrayUnion(updatedEntry),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error('Failed to update school schedule entry: ' + error.message);
  }
}; 

/**
 * Update the score and status for a game in both schools' schedules.
 * Updates the entry in both the home and opponent school's schedules for the sport.
 */
export const updateScoreForBothSchools = async (
  homeSchoolId: string,
  awaySchoolId: string,
  sport: string,
  location: string,
  time: string,
  homeName: string,
  awayName: string,
  score: any,
  status: string
): Promise<void> => {
  // Update home school's entry
  await updateSchoolScheduleEntry(
    homeSchoolId,
    sport,
    { location, time, opponent: awayName },
    { location, time, opponent: awayName, score, status }
  );
  // Update away school's entry
  await updateSchoolScheduleEntry(
    awaySchoolId,
    sport,
    { location, time, opponent: homeName },
    { location, time, opponent: homeName, score, status }
  );
}; 

// Articles Collection
const ARTICLES_COLLECTION = 'articles';

// Add a new article
export const addArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Starting addArticle function with data:', articleData);
    
    const firestorePayload = {
      ...articleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('=== FIRESTORE PAYLOAD ===\n' + JSON.stringify(firestorePayload, null, 2));
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), firestorePayload);

    console.log('Article added to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error in addArticle function:', error);
    throw new Error(`Failed to add article: ${error.message}`);
  }
};

// Get all articles
export const getArticles = async (): Promise<Article[]> => {
  try {
    console.log('Starting getArticles function');
    
    const q = query(collection(db, ARTICLES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('Query executed, got', querySnapshot.docs.length, 'articles');
    
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
    
    console.log('Articles processed:', articles);
    return articles;
  } catch (error: any) {
    console.error('Error in getArticles function:', error);
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }
};

// Delete an article
export const deleteArticle = async (articleId: string): Promise<void> => {
  try {
    console.log('Starting deleteArticle function for ID:', articleId);
    await deleteDoc(doc(db, ARTICLES_COLLECTION, articleId));
    console.log('Article deleted from Firestore');
  } catch (error: any) {
    console.error('Error in deleteArticle function:', error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }
};

// Update an article
export const updateArticle = async (articleId: string, updates: Partial<Article>): Promise<void> => {
  try {
    console.log('Starting updateArticle function for ID:', articleId);
    await updateDoc(doc(db, ARTICLES_COLLECTION, articleId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('Article updated in Firestore');
  } catch (error: any) {
    console.error('Error in updateArticle function:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }
}; 