const apiBaseURL = "https://jsonplaceholder.typicode.com";
const postsList = document.getElementById("postsList");
const userFilter = document.getElementById("userFilter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const postsPerPage = 10;
let currentUserFilter = "";
let totalPosts = 0;

async function initialize() {
  await loadUsers();
  await loadPosts();
  setupPagination();
}

async function loadUsers() {
  try {
    const response = await fetch(`${apiBaseURL}/users`);
    if (!response.ok) throw new Error("Failed to load users");
    
    const users = await response.json();
    userFilter.innerHTML = '<option value="">All users</option>';
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      userFilter.appendChild(option);
    });

    userFilter.addEventListener("change", (e) => {
      currentUserFilter = e.target.value;
      currentPage = 1;
      loadPosts();
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

async function loadPosts() {
  try {
    const userParam = currentUserFilter ? `&userId=${currentUserFilter}` : "";
    const response = await fetch(
      `${apiBaseURL}/posts?_page=${currentPage}&_limit=${postsPerPage}${userParam}`
    );
    if (!response.ok) throw new Error("Failed to load posts");
    
    const posts = await response.json();
    totalPosts = response.headers.get("x-total-count")
      ? parseInt(response.headers.get("x-total-count"), 10)
      : 0;

    postsList.innerHTML = "";
    posts.forEach((post) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.textContent = post.title;
      postDiv.addEventListener("click", () => showComments(post.id));
      postsList.appendChild(postDiv);
    });

    updatePagination();
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

async function showComments(postId) {
  try {
    const response = await fetch(`${apiBaseURL}/posts/${postId}/comments`);
    if (!response.ok) throw new Error("Failed to load comments");

    const comments = await response.json();

    postsList.innerHTML = `<h2>Comments for Post ID: ${postId}</h2>`;
    comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.innerHTML = `<strong>${comment.name}</strong><p>${comment.body}</p>`;
      postsList.appendChild(commentDiv);
    });
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}

function setupPagination() {
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPosts();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < Math.ceil(totalPosts / postsPerPage)) {
      currentPage++;
      loadPosts();
    }
  });
}

function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(
    totalPosts / postsPerPage
  )}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(totalPosts / postsPerPage);
}

initialize();
