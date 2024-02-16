import { initializeApp } from "firebase/app";

import {
  collection,
  getFirestore,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTedce8tiJSMCP8iks0NJd3T14jO2HTp8",
  authDomain: "todolist-v2-2308b.firebaseapp.com",
  projectId: "todolist-v2-2308b",
  storageBucket: "todolist-v2-2308b.appspot.com",
  messagingSenderId: "458753930243",
  appId: "1:458753930243:web:2d804e7c1e5a3683408a36",
};
// const firebaseConfig = {
//   apiKey: "AIzaSyDrzNYel2bfyRf8s6GBLBXErcwOI2wcnGE",
//   authDomain: "todolist-2f8c2.firebaseapp.com",
//   projectId: "todolist-2f8c2",
//   storageBucket: "todolist-2f8c2.appspot.com",
//   messagingSenderId: "1058186500133",
//   appId: "1:1058186500133:web:b9835a5006a8d2801b87cc",
// };

initializeApp(firebaseConfig);

const db = getFirestore();

const colRef2 = collection(db, "tasks");

const qRef = query(colRef2, orderBy("createdAt", "asc"));

let docRef;

let myTasks = [];

const auth = getAuth();

let listContainer = document.getElementById("listContainer");
try {
  listContainer.addEventListener("click", (e) => {
    let t = e.target;
    let ind = t.getAttribute("data-index");
    if (t.classList.contains("radiobtn")) {
      activate(ind);
    } else if (t.classList.contains("fa-solid", "fa-xmark")) {
      deleteTask(ind);
    } else if (t.classList.contains("taskText")) {
      editTask(ind);
    }
  });
} catch (err) {}

let k, a, p;
try {
  const googleAuthProvider = new GoogleAuthProvider();
  const loginBtn = document.getElementById("googleAuth");
  loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((userCredential) => {
        window.location.href = "./main.html";
      })
      .catch((error) => {});
  });
} catch (err) {
  let count = 0;

  getDocs(qRef).then((snapshot) => {
    let tasks = [];
    snapshot.docs.forEach((doc) => {
      tasks.push({ ...doc.data(), taskId: doc.id });
      count++;
    });
    snapshot.docs.forEach((doc) => {
      if (auth.currentUser.email === doc.data().email)
        myTasks.push({ ...doc.data(), taskId: doc.id });
    });
    window.addEventListener("load", onLoad());
  });

  const input = document.getElementById("inp");
  let g = listContainer.childNodes;
  let btn, li, i;

  function onLoad() {
    (k = 0), (p = 0), (a = 0);
    for (; a < myTasks.length; a++) {
      let id = myTasks[a].taskId;
      let t = myTasks[a].task;
      let email = myTasks[a].email;
      let presentEmail = auth.currentUser.email;

      if (email === presentEmail) {
        docRef = doc(db, "tasks", id);
        getDoc(docRef);

        li = document.createElement("div");
        btn = document.createElement("button");
        i = document.createElement("i");

        btn.className = "radiobtn";
        btn.setAttribute("id", `id${p}`);
        i.className = "fa-solid fa-xmark";
        li.className = "task";
        li.setAttribute("id", `tid${p}`);
        li.innerText = t;
        li.setAttribute("innerWidth", "10em");

        li.innerHTML = `
                <div class="con1" id= "div${k}">
                <div class="con11" id="id11">
                    <button id= "id${k}" data-index="${k}" onclick="activate()" class="radiobtn"></button>
                    <span id="sp${k}" data-index="${k}" class="taskText" onclick="editTask(${k})">${t}</span>
                </div>
                <div class="con12" data-index="${k}" onclick="deleteTask(${k})" id="mydiv${k}">
                    <i id="del${k}" data-index="${k}"  class="fa-solid fa-xmark"></i>
                </div>
            </div>`;

        listContainer.appendChild(li);
        let c = document.getElementById("listContainer");
        k = k + 1;
        p = p + 1;
      }
    }
  }
  k = count;
  p = count;

  const addTask = document.querySelector(".btn");

  addTask.addEventListener("click", (e) => {
    e.preventDefault();

    const t = input.value;

    if (t === "") alert("Please enter your Task");
    else {
      li = document.createElement("div");
      btn = document.createElement("button");
      i = document.createElement("i");

      btn.className = "radiobtn";
      btn.setAttribute("id", `id${p}`);
      i.className = "fa-solid fa-xmark";
      li.className = "task";
      li.setAttribute("id", `tid${p}`);
      li.innerText = t;
      li.setAttribute("innerWidth", "10em");

      try {
        li.innerHTML = `
            <div class="con1" id= "div${k}">
            <div class="con11" id="id11">
            <button id= "id${k}" data-index="${k}" onclick="activate();" class="radiobtn"></button>
            <span id="sp${k}" data-index="${k}" class="taskText" onclick="editTask(${k})">${t}</span>
            </div>
            <div class="con12" data-index="${k}" onclick="deleteTask(${k})" id="mydiv${k}">
            <i id="del${k}" data-index="${k}"  class="fa-solid fa-xmark"></i>
            </div>
            </div>`;
      } catch {}

      listContainer.appendChild(li);

      addDoc(colRef2, {
        task: input.value,
        createdAt: serverTimestamp(),
        email: auth.currentUser.email,
      }).then(() => {
        getDocs(qRef)
          .then((snapshot) => {
            myTasks = [];
            snapshot.docs.forEach((doc) => {
              if (doc.data().email === auth.currentUser.email)
                myTasks.push({ ...doc.data(), taskId: doc.id });
            });
          })
          .catch((err) => {});

        k = g.length - 1;
        p = g.length - 1;
        input.value = "";
      });
    }
  });
}

function activate(r) {
  let b = document.getElementById(`id${r}`);
  b.classList.toggle("greenFill");
  let txt = document.getElementById(`sp${r}`);
  txt.classList.toggle("strikeThrough");
}

async function deleteTask(r) {
  let c = document.getElementById("listContainer");
  let div = c.querySelector(`#div${r}`);
  let t = document.getElementById(`sp${r}`);
  let tInnerHTML = t.innerHTML;

  try {
    c.removeChild(div.parentElement);
  } catch (err) {}

  let i;
  for (i = 0; i < myTasks.length; i++) {
    if (tInnerHTML === myTasks[i].task) break;
  }

  let my_id = myTasks[i].taskId;
  const documentRef = doc(db, "tasks", my_id);

  try {
    await deleteDoc(documentRef);
    getDocs(qRef)
      .then((snapshot) => {
        myTasks = [];
        snapshot.docs.forEach((doc) => {
          if (doc.data().email === auth.currentUser.email)
            myTasks.push({ ...doc.data(), taskId: doc.id });
        });
      })
      .catch((err) => {});
  } catch (error) {}

  const listContainer = document.getElementById("listContainer");
  let g = listContainer.childNodes;
  k = g.length - 1;
  p = g.length - 1;

  let lists = document.getElementsByClassName("list-container");
  let liCon = lists[0];
  let children = liCon.childNodes;
  let ch, fch, ffch, lfch, Fffch, Lffch, Flfch;
  for (let j = children.length - 1; j >= 0; j--) {
    if (children[j]) {
      ch = children[j];
    }
    if (ch instanceof HTMLElement) {
      fch = ch.firstElementChild;
      if (fch) {
        ffch = fch.childNodes[1];
        lfch = fch.childNodes[3];
      }
      if (ffch) {
        Fffch = ffch.firstElementChild;
        Lffch = ffch.lastElementChild;
      }
      if (lfch) {
        Flfch = lfch.firstElementChild;
      }
      if (ch) {
        ch.setAttribute("id", `tid${j - 1}`);
        ch.setAttribute("id", `tid${j - 1}`);
      }
      fch.setAttribute("id", `div${j - 1}`);

      lfch.setAttribute("id", `mydiv${j - 1}`);
      lfch.setAttribute("data-index", `${j - 1}`);
      lfch.setAttribute("onclick", `deleteTask(${j - 1})`);

      Fffch.setAttribute("id", `id${j - 1}`);
      Fffch.setAttribute("data-index", `${j - 1}`);
      Fffch.setAttribute("onclick", `activate(${j - 1})`);

      Lffch.setAttribute("id", `sp${j - 1}`);
      Lffch.setAttribute("data-index", `${j - 1}`);
      Lffch.setAttribute("onclick", `editTask(${j - 1})`);

      Flfch.setAttribute("id", `del${j - 1}`);
      Flfch.setAttribute("data-index", `${j - 1}`);
    }
  }
}

let editBtn, addBtn, t, task, inp, row;
editBtn = document.createElement("button");
editBtn.textContent = "Edit";
editBtn.className = "btn";
function editTask(r) {
  addBtn = document.getElementById("addBtn");
  addBtn.style.display = "none";

  t = document.getElementById(`sp${r}`);
  task = t.innerHTML;
  inp = document.getElementById("inp");
  inp.innerHTML = task;
  inp.value = task;

  row = document.getElementById("row");
  if (row.childElementCount == 2) row.appendChild(editBtn);
}

let q, span, sInnerHTML;
editBtn.addEventListener("click", function (e) {
  e.preventDefault();

  let newTask = document.getElementById("inp").value;

  if (newTask === "") {
    alert("Please Select the Task to be edited");
  } else {
    if (e.target.className === "btn") {
      let div = document.getElementsByClassName("con11");
      for (q = 0; q < div.length; q++) {
        span = document.getElementById(`sp${q}`);
        sInnerHTML = span.innerHTML;
        if (task === span.innerHTML) {
          span.innerHTML = newTask;
          span.value = newTask;
          break;
        }
      }
    }
    inp.value = "";
    row.removeChild(editBtn);
    addBtn.style.display = "inline-block";

    myTasks = [];
    getDocs(qRef).then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (auth.currentUser.email === doc.data().email)
          myTasks.push({ ...doc.data(), taskId: doc.id });
      });

      let i;
      for (i = 0; i < myTasks.length; i++) {
        if (sInnerHTML === myTasks[i].task) {
          break;
        }
      }

      let my_id = myTasks[i].taskId;
      const docRef = doc(db, "tasks", my_id);
      updateDoc(docRef, {
        task: newTask,
      }).then(() => {
        getDocs(qRef).then((snapshot) => {
          myTasks = [];
          snapshot.docs.forEach((doc) => {
            if (doc.data().email === auth.currentUser.email)
              myTasks.push({ ...doc.data(), taskId: doc.id });
          });
        });
      });
    });
  }
});
