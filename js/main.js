var firebaseConfig = {
	apiKey: "AIzaSyAXBL7d1xz373WGkzqYNtDEQol_H8lHoaA",
	authDomain: "todo-952a0.firebaseapp.com",
	projectId: "todo-952a0",
	storageBucket: "todo-952a0.appspot.com",
	messagingSenderId: "777451288200",
	appId: "1:777451288200:web:6473b4e12e3657b7b2d13d",
	measurementId: "G-HRRPZHCMM5"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();


// ACCOUNT SIGNUP/LOGIN

const signUpPage = document.querySelector('.signup-page');
const loginPage = document.querySelector('.login-page');
const mainPage = document.querySelector('.main-page');
const signupPassword = document.getElementById('signup-password');
const signUpBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const signupForm = document.querySelector('.signup-form');
const loginForm = document.querySelector('.login-form');
const logoutBtn = document.getElementById('logout-btn');
const signupLink = document.getElementById('signup-link');
const returnLoginLink = document.getElementById('return-login');


function validatePassword(e) {
	const password = e.target.value;
	const requirements = document.querySelectorAll('li');

	let validations = [
		(password.search(/[A-Z]/) > -1),
		(password.length >= 5),
		(password.search(/[0-9]/) > -1),
		(password.search(/[!@#$%^&*]/) > -1)
	]

	requirements.forEach((item, index) => {
		validations[index] ? item.classList.add('check') : item.classList.remove('check');
	})

	// Changes the color of the password text upon validation & activates the sign in button
	let validate = validations.every(Boolean);

	if (validate === true) {
		signupPassword.classList.add('valid');
		signUpBtn.disabled = false;
	} else if (validate === false) {
		signupPassword.classList.remove('valid');
		signUpBtn.disabled = true;
	}
}


function showPassword(e) {
	if (e.target.previousSibling.type === 'password') {
		e.target.previousSibling.type = 'text';
		e.target.className = 'fa fa-eye-slash eye';
	} else {
		e.target.previousSibling.type = 'password';
		e.target.className = 'fa fa-eye eye';
	}
}

let icons = document.querySelectorAll('i');
icons.forEach((icon) => {
	icon.addEventListener('click', showPassword);
})



function signUpUser(e) {
	e.preventDefault();

	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;

	auth.createUserWithEmailAndPassword(email, password)
		.then((cred) => {
			return db.collection('users').doc(cred.user.uid).set({
				Email: email,
				Password: password
			}).then(() => {
				console.log('success!');
				showTodoList();
			}).catch((err) => {
				const signupError = document.getElementById('signup-error');
				signupError.textContent = "ERROR: Sign up failed. Please try again.";
			})
		})
}


function loginUser(e) {
	e.preventDefault();
	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	auth.signInWithEmailAndPassword(email, password)
		.then(() => {
			showTodoList();
		}).catch((err) => {
			const loginError = document.getElementById('login-error');
			loginError.textContent = "Username or password is incorrect.";
		})
}

// Hides/Displays login page or content page depending if logged in
auth.onAuthStateChanged((user) => {
	if (user) {
		console.log('You are signed in!');
		showTodoList();
	} else {
		console.log('You are NOT signed in!');
		showLoginPage();
	}
});


function showTodoList() {
	signUpPage.classList.add('hide');
	loginPage.classList.add('hide');
	mainPage.classList.remove('hide');
}

function showLoginPage() {
	signUpPage.classList.add('hide');
	loginPage.classList.remove('hide');
	mainPage.classList.add('hide');
}

function showSignUpPage() {
	loginPage.classList.add('hide');
	mainPage.classList.add('hide');
	signUpPage.classList.remove('hide');
}


function logout() {
	auth.signOut();
}


// ACCOUNT EVENT LISTENERS

signupPassword.addEventListener('input', validatePassword);
signUpBtn.addEventListener('click', signUpUser);
loginBtn.addEventListener('click', loginUser);
logoutBtn.addEventListener('click', logout);
signupLink.addEventListener('click', showSignUpPage);
returnLoginLink.addEventListener('click', showLoginPage);



// TODOS

const todoUl = document.querySelector('.todos');
let todoInput = document.getElementById('todo-input');
const submitBtn = document.getElementById('submit');
let form = document.querySelector('.new-task-container');


function addTodosToFirebase(e) {
	e.preventDefault();
	let todo = todoInput.value;
	let id = Date.now();
	form.reset();

	if (todo === "") {
		return;
	} else {
		auth.onAuthStateChanged((user) => {
			if (user) {
				db.collection(user.uid).doc('+' + id).set({
					id: '+' + id,
					todo
				}).then(() => {}).catch((error) => {
					console.log('error!');
				})
			}
		})
	}
}


function displayTodos(individualDoc) {
	newTodo = document.createElement('li');
	newTodo.id = individualDoc.id;
	newTodo.innerHTML = '<span class="bullet"></span>' + individualDoc.data().todo;
	newTodo.className = 'todo-item';
	todoUl.appendChild(newTodo);
	todoInput.value = "";
	let deleteBtn = document.createElement('button');
	deleteBtn.className = 'delete-btn delete';
	deleteBtn.setAttribute('aria-label', 'delete button');
	newTodo.appendChild(deleteBtn);

	deleteBtn.addEventListener('click', (e) => {
		let id = e.target.parentElement.id;

		auth.onAuthStateChanged((user) => {
			if (user) {
				db.collection(user.uid).doc(id).delete();
			}
		})
	})
}


submitBtn.addEventListener('click', addTodosToFirebase);


// realtime listener
auth.onAuthStateChanged(user => {
	if (user) {
		db.collection(user.uid).onSnapshot((snapshot) => {
			let changes = snapshot.docChanges();
			changes.forEach(change => {
				if (change.type == "added") {
					displayTodos(change.doc);
				} else if (change.type == 'removed') {
					let li = document.getElementById(change.doc.id);
					todoUl.removeChild(li);
				}
			})
		})
	}
})

// prevents flash of login form if user already logg
window.onload = setTimeout(() => {
	document.querySelector('main').classList.remove('hide');
	document.querySelector('main').classList.add('fade-in');
}, 500);