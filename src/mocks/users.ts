export interface IUser {
  id: number
  name: string
}

export const mockUsers: IUser[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Wilson' },
  { id: 5, name: 'Tom Brown' },
  { id: 6, name: 'Alex Davis' },
  { id: 7, name: 'Chris Lee' },
  { id: 8, name: 'Pat Kim' },
  { id: 9, name: 'Sam Taylor' },
  { id: 10, name: 'Jordan Martinez' },
  { id: 11, name: 'Casey Robinson' },
  { id: 12, name: 'Morgan Bailey' }
]

export const getUserById = (id: number | undefined): IUser | undefined => {
  if (!id) return undefined
  return mockUsers.find(user => user.id === id)
}

export const getUserNameById = (id: number | undefined): string => {
  const user = getUserById(id)
  return user?.name || ''
}
