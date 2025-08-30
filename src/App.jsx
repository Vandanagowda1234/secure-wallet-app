import React, { useState, useEffect, useRef } from 'react';
// Lucide React for modern icons
import { Wallet, Fingerprint, Lock, Send, History, UserPlus, LogIn, X } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

// Main App component
export default function App() {
  // Firebase state
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null); // Firebase user object
  const [userId, setUserId] = useState(null); // Firestore user ID, derived from Firebase auth
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Application state
  const [walletAddress, setWalletAddress] = useState('0x'); // Initialize with a placeholder
  const [balance, setBalance] = useState('0.0');
  const [isAuthenticatedBiometric, setIsAuthenticatedBiometric] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [appStatus, setAppStatus] = useState(''); // General status messages for the user
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Registration/Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between register/login form

  // Page navigation state: 'login', 'biometric', 'dashboard'
  const [currentPage, setCurrentPage] = useState('login'); 

  // Modals state (only transaction modal remains as it's triggered from dashboard)
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Ethers.js global object
  const ethers = window.ethers;
  const provider = window.ethereum && ethers ? new ethers.BrowserProvider(window.ethereum) : null;

  // App ID for Firestore collections
  // Placeholder for __app_id, you will replace this with your actual Firebase App ID
  const appId = "1:935467340315:web:7ac3e4cf3e168f7dc31ebe"; // <<< REMEMBER TO REPLACE THIS STRING WITH YOUR ACTUAL FIREBASE APP ID

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
      // Initialize Firebase only once
      if (!firebaseApp) {
        // --- PASTE YOUR ACTUAL FIREBASE CONFIGURATION HERE ---
        const firebaseConfig = {
          apiKey: "AIzaSyAArPdKW7uuaO7wFtRocxB_mxG495OcXCg",
          authDomain: "cyber-shield--ai.firebaseapp.com",
          projectId: "cyber-shield--ai",
          storageBucket: "cyber-shield--ai.firebasestorage.app",
          messagingSenderId: "935467340315",
          appId: "1:935467340315:web:7ac3e4cf3e168f7dc31ebe",
          measurementId: "G-7QN8HF15QZ"
        };
        // --- END OF FIREBASE CONFIGURATION ---

        const app = initializeApp(firebaseConfig);
        setFirebaseApp(app);
        setAuth(getAuth(app));
        setDb(getFirestore(app));
      }
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setAppStatus("Failed to initialize Firebase. Check console for details.");
    }
  }, [firebaseApp]); // Only run once on mount

  // Firebase Authentication State Listener
  useEffect(() => {
    if (auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
          setAppStatus(`Logged in as: ${currentUser.email || 'Anonymous User'}. UID: ${currentUser.uid}`);
          setIsFirebaseReady(true);
          
          // Fetch user profile and biometric status
          const userProfileData = await fetchUserProfile(currentUser.uid);

          // After Firebase auth, try connecting wallet
          if (ethers && provider) {
            await checkWalletConnected();
          } else {
             setAppStatus(prev => prev + " | MetaMask or ethers.js not detected.");
          }
          
          // Determine next page based on biometric enrollment status
          if (userProfileData && userProfileData.biometricEnrolled) {
            setIsAuthenticatedBiometric(true);
            setCurrentPage('dashboard');
          } else {
            setIsAuthenticatedBiometric(false);
            setCurrentPage('biometric'); // Go to biometric page if not enrolled
          }
        } else {
          setUser(null);
          setUserId(null);
          setIsFirebaseReady(false);
          setWalletAddress('0x'); // Reset wallet address
          setBalance('0.0');
          setIsAuthenticatedBiometric(false);
          setTransactions([]);
          setCurrentPage('login'); // Go back to login page
          setAppStatus('Please log in or register.');
        }
      });
      return () => unsubscribe(); // Cleanup listener
    }
  }, [auth, db, ethers, provider]);

  // Initial sign-in with custom token or anonymously
  useEffect(() => {
    const handleInitialAuth = async () => {
      // Only attempt if auth is initialized, no user is currently logged in, and we are on the login page
      // And we avoid re-triggering if the user is already in the process of logging in/registering via email/password
      if (auth && !user && currentPage === 'login' && !isLoading) { 
        try {
          // You can retrieve an initial auth token from your environment if provided
          // For local testing, you might leave this as an empty string to trigger anonymous sign-in
          const initialAuthToken = ""; // Replace with actual token if available, e.g., process.env.REACT_APP_INITIAL_AUTH_TOKEN;
          
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Signed in with custom token.");
          } else {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
          }
        } catch (error) {
          console.error("Initial Firebase sign-in failed:", error);
          
        }
      }
    };
    handleInitialAuth();
  }, [auth, user, currentPage, isLoading]); // Depend on 'auth' and 'user' to ensure it's initialized

  // --- User Profile Management (Firestore) ---
  const fetchUserProfile = async (uid) => {
    if (!db || !uid) return null;
    try {
      const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profiles`, 'userProfile');
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setIsAuthenticatedBiometric(data.biometricEnrolled || false);
        // Only update walletAddress state if it's not already set and data from Firestore exists
        if (data.walletAddress && walletAddress === '0x' && ethers && provider) {
          setWalletAddress(data.walletAddress);
          const rawBalance = await provider.getBalance(data.walletAddress);
          setBalance(ethers.formatEther(rawBalance));
        }
        return data; // Return data for immediate use
      } else {
        // Create a basic profile if not exists
        await setDoc(userDocRef, { biometricEnrolled: false, walletAddress: null });
        return { biometricEnrolled: false, walletAddress: null };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setAppStatus(`Error fetching profile: ${error.message}`);
      return null;
    }
  };

  const updateUserProfile = async (updates) => {
    if (!db || !userId) return;
    try {
      const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, 'userProfile');
      await setDoc(userDocRef, updates, { merge: true });
    } catch (error) {
      console.error("Error updating user profile:", error);
      setAppStatus(`Error updating profile: ${error.message}`);   }
  };

  // --- Auth Handlers (Register/Login/Logout) ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAppStatus(''); // Clear previous status
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateUserProfile({ email: userCredential.user.email, biometricEnrolled: false, walletAddress: null });
        setAppStatus('Registration successful. Redirecting to biometric setup...');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setAppStatus('Login successful. Redirecting to biometric verification...');
      }
      // onAuthStateChanged will handle setting currentPage to 'biometric' or 'dashboard'
    } catch (error) {
      console.error("Auth error:", error);
      setAppStatus(`Authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setAppStatus(''); // Clear previous status
    try {
      await signOut(auth);
      setAppStatus('Logged out successfully.');
      // Clear all sensitive state on logout
      setWalletAddress('0x'); // Reset wallet address
      setBalance('0.0');
      setIsAuthenticatedBiometric(false);
      setTransactions([]);
      setCurrentPage('login'); // Go back to login page
    } catch (error) {
      console.error("Logout error:", error);
      setAppStatus(`Logout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Wallet Connection Functions ---
  const connectWallet = async () => {
    try {
      if (!window.ethereum || !ethers || !provider) {
        setAppStatus('MetaMask is not installed or ethers.js is not loaded. Please install it to use this app.');
        return;
      }
      if (!user) {
        setAppStatus('Please log in first to connect your wallet.');
        return;
      }
      setIsLoading(true);
      setAppStatus('Connecting wallet...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);

      // Get balance
      const rawBalance = await provider.getBalance(address);
      setBalance(ethers.formatEther(rawBalance));
      
      await updateUserProfile({ walletAddress: address }); // Store wallet address in user profile
      setAppStatus('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setAppStatus('Error connecting wallet: ${error.message}');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnected = async () => {
    try {
      if (window.ethereum && provider && ethers && user && walletAddress === '0x') { // Only try to connect if walletAddress is not set
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          const rawBalance = await provider.getBalance(address);
          setBalance(ethers.formatEther(rawBalance));
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // --- Biometric Authentication Placeholder ---
  const handleBiometricAuthProcess = async () => {
    setIsLoading(true);
    setAppStatus('Initiating biometric authentication...');
    console.log('--- Placeholder: Biometric authentication initiated ---');

    // Simulate a delay for biometric scan
    await new Promise(resolve => setTimeout(Math.random() * 2000 + 1000, resolve)); // 1-3 seconds

    const success = Math.random() > 0.3; // Simulate success/failure

    if (success) {
      setIsAuthenticatedBiometric(true);
      await updateUserProfile({ biometricEnrolled: true }); // Update biometric status in Firestore
      setAppStatus('Biometric authentication successful! Redirecting to dashboard.');
      console.log('--- Placeholder: Biometric authentication successful ---');
      setCurrentPage('dashboard'); // Redirect to dashboard
    } else {
      setIsAuthenticatedBiometric(false);
      setAppStatus('Biometric authentication failed. Please try again.');
      console.log('--- Placeholder: Biometric authentication failed ---');
    }
    setIsLoading(false);
  };

  // --- Transaction with ZKP Placeholder ---
  const handleSendTransactionWithZKPProcess = async () => {
    if (!isAuthenticatedBiometric) {
      setAppStatus('Please authenticate with biometrics first.');
      return;
    }
    if (!walletAddress || walletAddress === '0x') {
      setAppStatus('Please connect your wallet first.');
      return;
    }
    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      setAppStatus('Please enter a valid recipient address and amount.');
      return;
    }
    if (parseFloat(amount) > parseFloat(balance)) {
        setAppStatus('Insufficient balance for this transaction.');
        return;
    }

    setIsLoading(true);
    setAppStatus('Generating Zero-Knowledge Proof and submitting transaction...');
    console.log('--- Placeholder: ZKP generation and transaction submission initiated ---');
    console.log('Recipient: ${recipientAddress}, Amount: ${amount}');

    // Simulate ZKP generation and blockchain transaction delay
    await new Promise(resolve => setTimeout(Math.random() * 3000 + 2000, resolve)); // 2-5 seconds

    const txSuccess = Math.random() > 0.2; // Simulate transaction success/failure

    if (txSuccess) {
      const newTransaction = {
        type: 'Sent',
        to: recipientAddress,
        amount: parseFloat(amount).toFixed(2),
        status: 'Confirmed',
        timestamp: new Date().toISOString()
      };
      
      // Add transaction to Firestore
      if (db && userId) {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/transactions`), newTransaction);
      }

      setBalance(prev => (parseFloat(prev) - parseFloat(amount)).toFixed(2)); // Update mock balance
      setRecipientAddress('');
      setAmount('');
      setAppStatus('Transaction successful with ZKP verification!');
      console.log('--- Placeholder: Transaction successful with ZKP verification ---');
      setShowTransactionModal(false);
    } else {
      setAppStatus('Transaction failed. ZKP verification or on-chain execution failed.');
      console.log('--- Placeholder: Transaction failed ---');
    }
    setIsLoading(false);
  };

  // --- Transaction History Function (Firestore) ---
  useEffect(() => {
    if (db && userId && isFirebaseReady && currentPage === 'dashboard') {
      const q = query(collection(db, `artifacts/${appId}/users/${userId}/transactions`), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(fetchedTransactions);
      }, (error) => {
        console.error("Error fetching transactions:", error);
        setAppStatus(`Error loading transaction history: ${error.message}`);
      });
      return () => unsubscribe();
    }
  }, [db, userId, isFirebaseReady, appId, currentPage]);

  // General Loading Spinner Component
  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Auth Page Component
  const AuthPage = () => (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-sans flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
          {isRegistering ? 'Register Account' : 'Login to Account'}
        </h2>
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !auth}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {setIsRegistering(!isRegistering); setAppStatus('');}} // Clear status on toggle
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
        {appStatus && <p className="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400">{appStatus}</p>}
      </div>
    </div>
  );

  // Biometric Page Component
  const BiometricPage = () => (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-sans flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full space-y-6 text-center">
        <h2 className="text-3xl font-bold text-green-700 dark:text-green-400">Biometric Verification Required</h2>
        <Fingerprint className="w-24 h-24 mx-auto text-green-500 dark:text-green-300 animate-pulse" />
        <p className="text-lg text-gray-700 dark:text-gray-300">
          To access your dashboard, please complete biometric verification.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          (This is a simulated step. In a real app, native device biometrics would be triggered.)
        </p>
        <button
          onClick={handleBiometricAuthProcess}
          disabled={isLoading || !user}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : 'Simulate Biometric Scan'}
        </button>
        {appStatus && <p className="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400">{appStatus}</p>}
        {user && ( // Allow logout from biometric page
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100 text-sm font-semibold rounded-lg shadow transition-all duration-200 disabled:opacity-50"
            >
              Logout
            </button>
          )}
      </div>
    </div>
  );

  // Transaction Modal Component
  const TransactionConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400 text-center">Confirm Transaction (with ZKP)</h2>
        <div className="space-y-3">
          <p className="text-lg">
            <span className="font-medium">Recipient:</span>{' '}
            <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded break-all text-sm">{recipientAddress}</code>
          </p>
          <p className="text-lg">
            <span className="font-medium">Amount:</span> {amount} ETH
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            (A Zero-Knowledge Proof will be generated on your device to authorize this transaction without revealing your private key. This is a simulated process.)
          </p>
        </div>
        <button
          onClick={handleSendTransactionWithZKPProcess}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate ZKP & Send Transaction'}
        </button>
        {appStatus && <p className="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400">{appStatus}</p>}
      </div>
    </div>
  );

  // Render the appropriate page based on currentPage state
  if (currentPage === 'login') {
    return <AuthPage />;
  } else if (currentPage === 'biometric') {
    return <BiometricPage />;
  } else if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-sans flex flex-col items-center">
        {showTransactionModal && <TransactionConfirmationModal />}

        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 space-y-8">
          <h1 className="text-4xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-8">
            Secure Blockchain Transactions
          </h1>

          {user && ( // Only show dashboard elements if a user is logged in
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Logged in as: <span className="font-medium">{user.email || 'Anonymous'}</span> (UID: <code className="break-all">{userId}</code>)
                </p>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner /> : 'Logout'}
                </button>
              </div>

              {/* Wallet Connection Section */}
              <div className="border border-indigo-200 dark:border-indigo-700 rounded-lg p-6 shadow-md space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Wallet className="w-6 h-6" /> Wallet Status
                </h2>
                {walletAddress && walletAddress !== '0x' ? (
                  <div className="space-y-2">
                    <p className="text-lg">
                      <span className="font-medium">Connected Address:</span>{' '}
                      <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded break-all text-sm">{walletAddress}</code>
                    </p>
                    <p className="text-lg">
                      <span className="font-medium">Balance:</span> {balance} ETH (Mock)
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg mb-4">No wallet connected.</p>
                    <button
                      onClick={connectWallet}
                      disabled={isLoading || !isFirebaseReady || !ethers}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <LoadingSpinner /> : (
                        <>
                          <Wallet className="w-5 h-5" /> Connect Wallet
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Biometric Status Section (No longer an interactive button here) */}
              <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 shadow-md space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Fingerprint className="w-6 h-6" /> Biometric Status
                </h2>
                {isAuthenticatedBiometric ? (
                  <p className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                    <Lock className="w-5 h-5" /> Biometric authentication is active.
                  </p>
                ) : (
                  <p className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                    <X className="w-5 h-5" /> Biometric authentication not completed.
                  </p>
                )}
              </div>

              {/* Transaction Section */}
              <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-6 shadow-md space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Send className="w-6 h-6" /> Send Transaction (with ZKP)
                </h2>
                <input
                  type="text"
                  placeholder="Recipient Address (e.g., 0x...)"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading || !isAuthenticatedBiometric || !ethers}
                />
                <input
                  type="number"
                  placeholder="Amount (ETH)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading || !isAuthenticatedBiometric || !ethers}
                />
                <button
                  onClick={() => setShowTransactionModal(true)}
                  disabled={isLoading || !isAuthenticatedBiometric || !walletAddress || walletAddress === '0x' || !recipientAddress || !amount || parseFloat(amount) <= 0 || !ethers}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LoadingSpinner /> : (
                    <>
                      <Send className="w-5 h-5" /> Send Transaction
                    </>
                  )}
                </button>
              </div>

              {/* Transaction History Section */}
              <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-6 shadow-md space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <History className="w-6 h-6" /> Transaction History
                </h2>
                {transactions.length > 0 ? (
                  <ul className="space-y-3">
                    {transactions.map(tx => (
                      <li key={tx.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex-1">
                          <p className="font-medium text-lg">
                            {tx.type === 'Sent' ? `Sent ${tx.amount} ETH to ` : `Received ${tx.amount} ETH from `}
                            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded break-all text-sm">
                              {tx.type === 'Sent' ? tx.to : tx.from}
                            </code>
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {tx.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No transactions yet.</p>
                )}
              </div>
            </>
          )}
          {/* Global status message */}
          {appStatus && <p className="mt-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{appStatus}</p>}
        </div>
      </div>
    );
  }
  return null; // Should not reach here
}