console.log('Main.js is loading...');

import { Clerk } from '@clerk/clerk-js'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log('Publishable Key:', publishableKey);

async function initClerk() {
  try {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('App div not found!');
      return;
    }

    if (!publishableKey || publishableKey === 'pk_test_...') {
      appDiv.innerHTML = `
        <div style="color: red; padding: 20px; font-family: sans-serif;">
          <h1>Clerk Setup Required</h1>
          <p>Please add your <strong>actual</strong> Publishable Key to <code>.env.local</code>.</p>
          <p>Current value: <code>${publishableKey}</code></p>
        </div>
      `;
      return;
    }

    const clerk = new Clerk(publishableKey);
    console.log('Clerk instance created, loading...');
    await clerk.load();
    console.log('Clerk loaded successfully. SignedIn:', clerk.isSignedIn);

    if (clerk.isSignedIn) {
      appDiv.innerHTML = '<div id="user-button"></div>';
      clerk.mountUserButton(document.getElementById('user-button'));
    } else {
      appDiv.innerHTML = '<div id="sign-up"></div>';
      clerk.mountSignUp(document.getElementById('sign-up'));
    }
  } catch (err) {
    console.error('Error during Clerk init:', err);
    document.getElementById('app').innerHTML = `<pre style="color: red;">${err.stack}</pre>`;
  }
}

initClerk();
