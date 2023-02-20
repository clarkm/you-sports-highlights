import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { createUserWithEmailAndPassword, getAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, onChildAdded, onDisconnect, onValue, ref, set } from "firebase/database";

import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';
import { VidRequestService } from './vid-request.service';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  // Your web app's Firebase configuration
firebaseConfig = {
  apiKey: "AIzaSyB7NPvyrv0bPIhedYBveQQIUlXBTIo0L-g",
  authDomain: "sports-highlights-search.firebaseapp.com",
  databaseURL: "https://sports-highlights-search-default-rtdb.firebaseio.com",
  projectId: "sports-highlights-search",
  storageBucket: "sports-highlights-search.appspot.com",
  messagingSenderId: "892890974934",
  appId: "1:892890974934:web:04e2338650c8dfc0bf1777"
};
auth: any;
database: any;
user: any;
userId: any;
userRef: any;

signInForm: FormGroup = new FormGroup({
  email: new FormControl(''),
  password: new FormControl('')
});
signUpForm: FormGroup = new FormGroup({
  email: new FormControl(''),
  password: new FormControl('')
});

  results$: any;
  vidList: any;

  constructor(private vidRequestService: VidRequestService, private fb: FormBuilder) {
    // Initialize Firebase
    const app = initializeApp(this.firebaseConfig);

    this.auth = getAuth(app);

    this.database = getDatabase(app);

    this.auth.onAuthStateChanged((user:any) => {
      console.log('logged in user', user);
      if (user) {
        // you're logged in
        this.user = user;
        this.userId = user.uid;
        this.userRef = ref(this.database, `users/${this.userId}` );

        onDisconnect(this.userRef).remove();

      }
      else {
        // you're logged out
      }

    });

   
  }

  createAccount() {
    const email = this.signUpForm.get('email')?.value;
    const password = this.signUpForm.get('password')?.value;
    createUserWithEmailAndPassword(this.auth,email,password)
    .then((userCredential: any) => {
      // User created successfully
      const user = userCredential.user;
    })
    .catch((error: any) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // Handle error
      alert(`error creating account. code: ${errorCode}. Message: ${errorMessage}`)
    });  
  

  }

  onSignInSubmit() {
    const email = this.signInForm.get('email')?.value;
    const password = this.signInForm.get('password')?.value;
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential: { user: any; }) => {
        // User signed in successfully
        const user = userCredential.user;
        // Do something with the user object
      })
      .catch((error: { code: any; message: any; }) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Handle error
        alert(`error signing in user; code: ${errorCode}, Message: ${errorMessage}`)
      });
  }
  
  onSignOutClick() {
    signOut(this.auth).then(() => {
      // Sign-out successful
      // Reload the current page
      location.reload();

    }).catch((error: any) => {
      // Handle error
      alert('error on sign out');
    });
  }

  search(term: string) {
    this.results$ = this.vidRequestService.callYoutubeApi(term);

    this.results$.pipe(take(1)).subscribe((res: any) => {
      // debugger
      this.vidList = res.items
    })
  }

  ngOnInit(): void {
  }
  
}
