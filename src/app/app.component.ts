import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { createUserWithEmailAndPassword, getAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { get, getDatabase, onChildAdded, onDisconnect, onValue, ref, remove, set } from "firebase/database";

import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SafePipe } from './safe.pipe';
import { VidRequestService } from './vid-request.service';
import { VideoDialogComponent } from './components/video-dialog/video-dialog.component';
import { default as env } from '../env.json';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // Your web app's Firebase configuration
firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
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
  @ViewChild(MatSort) sort: MatSort | unknown;


  selections:any;
  selectionForm = new FormGroup({
    name: new FormControl(''),
    selections: new FormControl([]),
    preLoad: new FormControl(false)
  });


  constructor(private vidRequestService: VidRequestService, 
    private fb: FormBuilder, 
    private dialog: MatDialog) {
    // Initialize Firebase
    const app = initializeApp(this.firebaseConfig);

    this.auth = getAuth(app);

    this.database = getDatabase(app);

    const selectionRef = ref(this.database, `users/${this.userId}` );
    onValue(selectionRef, (snapshot:any) => {
      const data = snapshot.val()?.selections;
      if (data) {
        this.selections = data;
      } else {
        this.selections = [];
      }
      console.log('snapshot: ', data)
      // const selectionKeys = Object.keys(data);
    });

   
  }
  
  onSortChange(e: Sort) {
    if (this.vidList) {
      const direction = e.direction === 'asc' ? 1 : -1;
      this.vidList.data = this.vidList.data.slice().sort((a: any, b: any) => {
        const propA = a.snippet[e.active];
        const propB = b.snippet[e.active];
        return (propA < propB ? -1 : propA > propB ? 1 : 0) * direction;
      });
    }
  }
  
  openVideoDialog(vidUrl: string) {
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      data: {
        videoUrl: `https://www.youtube.com/embed/${vidUrl}`
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

  search(term: string, chanId?:string) {
    this.results$ = this.vidRequestService.callYoutubeApi(term, chanId ? chanId : undefined);

    this.results$.pipe(take(1)).subscribe((res: any) => {
      this.vidList = new MatTableDataSource(res.items);

      if (this.sort) {
        this.vidList.sort = this.sort;
      }
    })
  }


onSelectionSubmit() {
  this.selections.push(
    {
      name: this.selectionForm.value.name,
      preLoad: this.selectionForm.value.preLoad
    }
    );
  const selectionRef = ref(this.database, `users/${this.userId}` );
  set(selectionRef, {
    selections: this.selections
  });
}

onPreLoadToggle(selection: any) {
  const userId = this.auth.currentUser.uid;
  const selectionRef = ref(this.database, `users/${userId}`);
  get(selectionRef).then((snapshot: any) => {
    const data = snapshot.val();
    const selectionIndex = data.selections.findIndex((item: { name: any; }) => item.name === selection.name)
    if (selectionIndex >= 0) {
      data.selections[selectionIndex].preLoad = !data.selections[selectionIndex].preLoad;
      set(selectionRef, data);
    }
  });
}


onDeleteSelection(selection: any) {
  const userId = this.auth.currentUser.uid;
  const selectionRef = ref(this.database, `users/${userId}`);
  get(selectionRef).then((snapshot: any) => {
    const data = snapshot.val();
    const selectionIndex = data.selections.findIndex((item: { name: any; }) => item.name === selection.name)
    if (selectionIndex >= 0) {
      const newSelections = [...data.selections.slice(0, selectionIndex), ...data.selections.slice(selectionIndex + 1)];
      set(selectionRef, newSelections);
    }
  });
}


  ngOnInit() {
    this.auth.onAuthStateChanged((user:any) => {
      if (user) {
        this.userId = user.uid;
        this.user = user;
        this.userRef = ref(this.database, `users/${this.userId}` );
        const selectionRef = ref(this.database, `users/${this.userId}/selections`);
        onValue(selectionRef, (snapshot:any) => {
          const data = snapshot.val();
          if (data) {
            this.selections = Object.values(data);
            const selected = data.find((item: { preLoad: boolean }) => item.preLoad);
            if (selected) {
              this.search(selected.name);
            }
            // Initialize the sort for the vidList here
            this.vidList = new MatTableDataSource([]);
            this.vidList.sort = this.sort;

          } else {
            this.selections = [];
          }
        });
      } else {
        this.selections = [];
      }
    });
  }
  
}
