export type TaskCommentView = {
  id: string
  taskId: string
  body: string
  author: {
    id: string
    name: string
  }
  createdAt: Date
}
