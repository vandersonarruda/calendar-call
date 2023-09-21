import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, username } = req.body

  // check on database if username already exist
  const userExists = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (userExists) {
    return res.status(400).json({
      message: 'Username already taken.',
    })
  }

  // create a new user on database
  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  })

  // using to cookies to persist the username to next screen
  // nookies (for next.js)
  setCookie({ res }, '@calendarcall:userId', user.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/', // all routes can access
  })

  return res.status(201).json(user)
}
