// TO DO 

// • Uncomment ShowMainPage function in auth state when done testing login
// • Link "New User, sign up here to proper form



//		Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();

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

	// Checks off each requirement when fulfilled
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
				showMainPage();
			}).catch((err) => {
				const signupError = document.getElementById('signup-error');
				//				signupError.textContent = err.message;
				signupError.textContent = "ERROR: Sign up failed. Please try again.";
			})
		})
}


function loginUser(e) {
	e.preventDefault();

	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	//	console.log(email, password);

	auth.signInWithEmailAndPassword(email, password)
		.then(() => {
			showMainPage();
		}).catch((err) => {
			const loginError = document.getElementById('login-error');
			loginError.textContent = "Username or password is incorrect.";
		})
}


auth.onAuthStateChanged((user) => {
	if (user) {
		console.log('You are signed in!');
		showMainPage();
	} else {
		console.log('You are NOT signed in!');
		hideMainPage();
	}
});


// Delete me when ready
//	auth.onAuthStateChanged((user) => {
//		console.log(user.uid);
//	})



function showMainPage() {
	signUpPage.classList.add('hide');
	loginPage.classList.add('hide');
	mainPage.classList.remove('hide');
}

function hideMainPage() {
	signUpPage.classList.add('hide');
	loginPage.classList.remove('hide');
	mainPage.classList.add('hide');
}


function logout() {
	auth.signOut();
}


// ACCOUNT EVENT LISTENERS

signupPassword.addEventListener('input', validatePassword);
signUpBtn.addEventListener('click', signUpUser);
loginBtn.addEventListener('click', loginUser);
logoutBtn.addEventListener('click', logout);

signupLink.addEventListener('click', () => {
	signUpPage.classList.remove('hide');
	loginPage.classList.add('hide');
	mainPage.classList.add('hide');
})

returnLoginLink.addEventListener('click', () => {
	signUpPage.classList.add('hide');
	loginPage.classList.remove('hide');
	mainPage.classList.add('hide');
})






// TODOS

const todoUl = document.querySelector('.todos');
let todoInput = document.getElementById('todo-input');
const submitBtn = document.getElementById('submit');
let form = document.querySelector('.new-task-container');
let todosArray = [];


function addTodo() {
	addTodosToFirebase();
	displayTodos();
}


function addTodosToFirebase(e) {
	e.preventDefault();

	let todo = todoInput.value;
	let id = Date.now();
	form.reset();

	auth.onAuthStateChanged((user) => {
		if (user) {
			db.collection(user.uid).doc('+' + id).set({
				id: '+' + id,
				todo
			}).then(() => {
				console.log('todo added!');
			}).catch((error) => {
				console.log('error!');
			})
		}
	})
}


function displayTodos(individualDoc) {

	newTodo = document.createElement('li');
	newTodo.id = individualDoc.id;
	newTodo.innerHTML = '<span class="bullet"></span>' + " " + individualDoc.data().todo;
	newTodo.contentEditable = true;
	newTodo.className = 'todo-item';
	todoUl.appendChild(newTodo);
	todoInput.value = "";
	let deleteBtn = document.createElement('button');
	newTodo.appendChild(deleteBtn);
	deleteBtn.className = 'delete-btn delete';

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









//
//function addTodo(e) {
//	e.preventDefault();
//	if (todoInput.value === "") {
//		return;
//	} else {
//		newTodo = document.createElement('li');
//		newTodo.innerHTML = '<span class="bullet"></span>' + " " + todoInput.value;
//		newTodo.contentEditable = true;
//		newTodo.className = 'todo-item';
//		todoUl.appendChild(newTodo);
//		todoInput.value = "";
//		let deleteBtn = document.createElement('button');
//		newTodo.appendChild(deleteBtn);
//		deleteBtn.className = 'delete-btn delete';
//	}
//
//}
//
//function markCompleted(e) {
//	if (e.target.classList.contains('bullet')) {
//		e.target.classList.toggle('done');
//		let li = e.target.parentElement;
//		li.classList.toggle('complete');
//		//				todoUl.appendChild(li);
//	}
//};
//
//function deleteTodo(e) {
//	if (e.target.classList.contains('delete')) {
//		let li = e.target.parentElement;
//		todoUl.removeChild(li);
//	}
//};
//
//// TODO LIST EVENT LISTENERS
//
//
//submitBtn.addEventListener('click', addTodo);
//todoUl.addEventListener('click', markCompleted);
//todoUl.addEventListener('click', deleteTodo);