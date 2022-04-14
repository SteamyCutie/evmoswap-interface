import React, { useState } from 'react'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import Container from '../../components/Container'

const people = [
  {
    name: 'Coin Toss',
    role: 'Heads or Tails, with odds of winning at 50:50. Payouts are up to 1.98x!',
    imageUrl: 'https://croissant.games/icons/coin-flip/coin.png',
    gameFiUrl: 'https://croissant.games/coin-toss/EMO',
  },
  {
    name: 'CRO Roll',
    role: 'You are winning if the number lands between your selected range. Win up to 19x your wager',
    imageUrl: 'https://croissant.games/icons/cro-roll.png',
    gameFiUrl: 'https://croissant.games/cro-roll/EMO',
  },
  {
    name: 'Dice Roll',
    role: 'Guess the dice face that comes up. Payouts are up to 5.94x !',
    imageUrl: 'https://croissant.games/icons/dice/dice.png',
    gameFiUrl: 'https://croissant.games/dice-roll/EMO',
  },
  {
    name: 'Roulette',
    role: 'Choose numbers from 0 to 36. Payouts are up to 34.65x !',
    imageUrl: 'https://croissant.games/icons/roulette/roulette.png',
    gameFiUrl: 'https://croissant.games/roulette/EMO',
  },
]

export default function GameFi() {
  const { i18n } = useLingui()
  return (
    <Container id="gamefi-page" className="py-4 md:py-8 lg:py-12" maxWidth="full">
      <Head>
        <title key="title">GameFi | EvmoSwap</title>
        <meta key="description" name="description" content="Boost EvmoSwap" />
      </Head>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">CROissant Games</h2>
            <p className="text-xl text-gray-300">
              GameFi partner - user playing any of the games will not require any gas fees from the player end!
            </p>
          </div>
          <ul role="list" className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8">
            {people.map((person) => (
              <li key={person.name} className="px-6 py-10 text-center bg-gray-800 rounded-lg xl:px-10 xl:text-left">
                <div className="space-y-6 xl:space-y-10">
                  <img className="w-20 h-20 mx-auto xl:w-56 xl:h-56" src={person.imageUrl} alt="" />
                  <div className="space-y-2 xl:flex xl:items-center xl:justify-between">
                    <a
                      href={person.gameFiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="space-y-1 text-lg font-medium leading-6"
                    >
                      <h3 className="text-white">{person.name}</h3>
                      <p className="text-indigo-400">{person.role}</p>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  )
}
