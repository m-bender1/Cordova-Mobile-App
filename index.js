// Matt Bender - Final Project
// Dec. 6, 2020

// TODO:
// Firebase [*]
// Media [*]
// Network [*]
// Notification [*]
// Geolocation [*]

// Wait for device API libraries to load
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
function onDeviceReady() {
    firebaseApp(); // firebase
    // network API usage
    document.addEventListener("online", networkIsOnline, false);
    document.addEventListener("offline", networkIsOffline, false);
    useMedia();
}

function firebaseApp() {
    // got rid of all the event listeners, they were causing problems.
    console.log("Firebase Ready");
}

// registration function
function registerInFirebase() {
    var email = document.getElementById('register-email').value;
    var password = document.getElementById('register-password').value;

    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }

    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(firebaseUser) {
            alert('user registered!');
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/weak-password') {
                alert('The password is too weak.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
}

// login function 
function loginWithFirebase() {
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }

    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(firebaseUser) {
            alert('user logged in!');
            window.location = 'updateProfile.html';
            // resetting form
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
        });
}

// signout user 
function signoutWithFirebase() {
    firebase.auth().signOut().then(function() {
        // if logout was successful
        if (!firebase.auth().currentUser) {
            console.log("Signout Successful")
        } else {
            console.log("signout not successful")
        }
    });
    alert('user was logged out!');
    window.location = 'index.html';
}

// hiding output div
document.getElementById('display-profile').style.display = 'none';

function updateProfile() {
    // save the data with firebase to update/create profile
    // form variables
    var fName = document.getElementById("first-name").value;
    var lName = document.getElementById("last-name").value;
    var bday = document.getElementById("birthday").value;
    var gen;
    if (document.getElementById("male").checked == true) {
        gen = document.getElementById("male").value;
    } else if (document.getElementById("female").checked == true) {
        gen = document.getElementById("female").value;
    }

    // current user variable
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user);
            user = user.uid;
            var db = firebase.firestore(app);
            db.collection('users').doc(user).set({
                firstName: fName,
                lastName: lName,
                birthday: bday,
                gender: gen,
            }, {
                merge: true // set with merge set to true to make sure we don't blow away existing data we didnt intend to
            })
            displayProfile(user);
        }
    })
}

function displayProfile(user) {
    navigator.geolocation.getCurrentPosition(startGeoWatch, onError, { maximumAge: 300000, timeout: 5000, enableHighAccuracy: true }) // geolocation API
    document.getElementById('display-profile').style.display = 'block';
    document.getElementById('update-profile').style.display = 'none';
    // window.location = 'displayProfile.html';
    console.log(user)
    var db = firebase.firestore(app);
    db.collection('users').doc(user).get()
        .then(function(doc) {
            if (doc.exists) {
                document.getElementById("display-output").innerHTML = "Name: " + doc.data().firstName + " " + doc.data().lastName +
                    "<br>Birthday: " + doc.data().birthday + "<br>Gender: " + doc.data().gender;
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
}

// on error for geowatch
var onError = function(error) {
    console.log('code: ' + error.code + '\n' +
        'message' + error.message
    );
}

// on success + button/div for geo watch
var watchID = null;

function startGeoWatch() {
    // disable button once watch has started - click it again would cause issues
    // stop function will renable it once this func is executed
    // startBtn.addEventListener("click", stopGeoWatch, false);
    // start watch and store ID to clear later
    watchID = navigator.geolocation.watchPosition(
        // inline onsuccess function, parameter position
        (postition) => {
            document.getElementById('location-output').innerHTML = 'Latitude: ' + postition.coords.latitude + '<br>' +
                'Longitude: ' + postition.coords.longitude;
        },
        onError, { timeout: 5000, enableHighAccuracy: false }
    );
}



// TODO: 
// Media plays on registration/login
// Call media player function in login and register forms. Maybe find 2 different sounds.
// battery status function

function backToEdit() {
    document.getElementById('display-profile').style.display = 'none';
    document.getElementById('update-profile').style.display = 'block';
}

// net. status callbacks
function networkIsOnline() {
    navigator.notification.alert("Network online. \nConnection Type: " + navigator.connection.type);
}

function networkIsOffline() {
    navigator.notification.alert("Network offline!");
}


function useMedia() {
    var sourceToPlay;
    if (device.platform === 'Android') {
        sourceToPlay = '/android_asset/www/win95.mp3';
    } else {
        sourceToPlay = 'win95.mp3';
    }
    var media = new Media(sourceToPlay, playMedia, mediaError);

    function playMedia() {
        media.play();
    }

    function mediaError(error) {
        navigator.notification.alert(error);
    }
}