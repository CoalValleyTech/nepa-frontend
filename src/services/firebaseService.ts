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
  arrayUnion
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
  schoolId: string,
  schoolName: string,
  sport: string,
  entry: ScheduleEntry
): Promise<void> => {
  try {
    await addDoc(collection(db, 'schedules'), {
      schoolId,
      schoolName,
      sport,
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (error: any) {
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