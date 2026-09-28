import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDoc, setLogLevel } from 'firebase/firestore';
import { AppSettings } from '../types';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

try {
  setLogLevel('silent');
} catch {
  // ignore
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default exported instances per Firebase skill standards
export const app = !getApps().length ? initializeApp(defaultFirebaseConfig) : getApp();

const defaultDbId = defaultFirebaseConfig.firestoreDatabaseId && defaultFirebaseConfig.firestoreDatabaseId !== '(default)'
  ? defaultFirebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true
    },
    defaultDbId
  );
} catch {
  firestoreInstance = defaultDbId ? getFirestore(app, defaultDbId) : getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

let firebaseApp: any = app;
let firestoreDb: any = db;

export function initFirebase(settings?: AppSettings) {
  try {
    const config = settings && settings.firebase_api_key ? {
      apiKey: settings.firebase_api_key,
      authDomain: settings.firebase_auth_domain,
      projectId: settings.firebase_project_id,
      storageBucket: settings.firebase_storage_bucket,
      messagingSenderId: settings.firebase_messaging_sender_id,
      appId: settings.firebase_app_id
    } : defaultFirebaseConfig;

    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    
    const dbId = defaultFirebaseConfig.firestoreDatabaseId && defaultFirebaseConfig.firestoreDatabaseId !== '(default)'
      ? defaultFirebaseConfig.firestoreDatabaseId
      : undefined;

    try {
      firestoreDb = initializeFirestore(
        firebaseApp,
        {
          experimentalForceLongPolling: true
        },
        dbId
      );
    } catch {
      firestoreDb = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
    }

    return { app: firebaseApp, db: firestoreDb };
  } catch (err) {
    return { app: null, db: null };
  }
}

export async function testConnection() {
  if (!firestoreDb) {
    initFirebase();
  }
  if (!firestoreDb) return false;
  try {
    await getDoc(doc(firestoreDb, 'test', 'connection'));
    return true;
  } catch {
    return false;
  }
}
