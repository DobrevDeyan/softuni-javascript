import { html } from "../lib.js"
import {
  getBookById,
  deleteBook,
  getLikesByBookId,
  getMyLikeByBookId,
  likeBook,
} from "../api/data.js"
import { getUserData } from "../util.js"

const detailsTemplate = (
  book,
  isOwner,
  onDelete,
  likes,
  showLikeButton,
  onLike
) => html`<section id="details-page" class="details">
  <div class="book-information">
    <h3>${book.title}</h3>
    <p class="type">Type: ${book.type}</p>
    <p class="img"><img src="${book.imageUrl}" /></p>
    <div class="actions">
      <!-- Edit/Delete buttons ( Only for creator of this book )  -->

      ${bookControlsTemplate(book, isOwner, onDelete)}

      <!-- Bonus -->
      <!-- Like button ( Only for logged-in users, which is not creators of the current book ) -->
      ${likeControlTemplate(showLikeButton, onLike)}
      <!-- ( for Guests and Users )  -->
      <div class="likes">
        <img class="hearts" src="/images/heart.png" />
        <span id="total-likes">Likes: ${likes}</span>
      </div>
      <!-- Bonus -->
    </div>
  </div>
  <div class="book-description">
    <h3>Description:</h3>
    <p>${book.description}</p>
  </div>
</section>`

const likeControlTemplate = (showLikeButton, onLike) => {
  if (showLikeButton) {
    return html`<a @click=${onLike} class="button" href="javascript:void(0)"
      >Like</a
    >`
  } else {
    return null
  }
}
const bookControlsTemplate = (book, isOwner, onDelete) => {
  if (isOwner) {
    return html`
      <a class="button" href="/edit/${book._id}">Edit</a>
      <a @click=${onDelete} class="button" href="/">Delete</a>
    `
  } else {
    return null
  }
}

export async function detailsPage(ctx) {
  // const book = await getBookById(ctx.params.id)
  const userData = getUserData()

  const [book, likes, hasLike] = await Promise.all([
    getBookById(ctx.params.id),
    getLikesByBookId(ctx.params.id),
    userData ? getMyLikeByBookId(ctx.params.id, userData.id) : 0,
  ])

  const isOwner = userData && userData.id == book._ownerId

  const showLikeButton =
    userData != null && isOwner == false && hasLike == false

  ctx.render(
    detailsTemplate(book, isOwner, onDelete, likes, showLikeButton, onLike)
  )

  async function onDelete(event) {
    const choice = confirm(
      "Are you sure you want to delete this meme forever ? "
    )
    if (choice) {
      await deleteBook(ctx.params.id)
      ctx.page.redirect("/")
    }
  }

  async function onLike(event) {
    await likeBook(ctx.params.id)
    ctx.page.redirect("/details/" + ctx.params.id)
  }
}

// ${isOwner
//   ? html`<a class="button" href="/edit/${book._id}">Edit</a>
//       <a @click=${onDelete} class="button" href="/">Delete</a>`
//   : null}
