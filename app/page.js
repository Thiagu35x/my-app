"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Skull } from 'lucide-react';

const WORD_LIST = [
  'REACT', 'JAVASCRIPT', 'PROGRAMACAO', 'COMPUTADOR', 'TECNOLOGIA',
  'ALGORITMO', 'DESENVOLVIMENTO', 'INTERFACE', 'RESPONSIVO', 'FRAMEWORK',
  'COMPONENTE', 'FUNCAO', 'VARIAVEL', 'ARRAY', 'OBJETO',
  'CLASSE', 'METODO', 'PROPRIEDADE', 'EVENTO', 'CALLBACK',
  'PROMISE', 'ASYNC', 'AWAIT', 'FETCH', 'API',
  'JSON', 'HTML', 'CSS', 'NODEJS', 'TYPESCRIPT',
  'WEBPACK', 'BABEL', 'REDUX', 'HOOKS', 'STATE',
  'PROPS', 'CONTEXT', 'EFFECT', 'MEMO', 'LAZY'
];

const MAX_WRONG_GUESSES = 6;

const HangmanDrawing = ({ wrongGuessCount }) => {
  const parts = [
    // Base
    <line key="base" x1="10" y1="190" x2="100" y2="190" stroke="white" strokeWidth="4" />,
    // Pole
    <line key="pole" x1="30" y1="190" x2="30" y2="20" stroke="white" strokeWidth="4" />,
    // Top beam
    <line key="top" x1="30" y1="20" x2="100" y2="20" stroke="white" strokeWidth="4" />,
    // Noose
    <line key="noose" x1="100" y1="20" x2="100" y2="40" stroke="white" strokeWidth="4" />,
    // Head
    <circle key="head" cx="100" cy="55" r="15" stroke="white" strokeWidth="4" fill="none" />,
    // Body
    <line key="body" x1="100" y1="70" x2="100" y2="140" stroke="white" strokeWidth="4" />
  ];

  return (
    <svg width="150" height="200" className="mx-auto">
      {parts.slice(0, wrongGuessCount)}
    </svg>
  );
};

const Keyboard = ({ onLetterClick, usedLetters, correctLetters }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  return (
    <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
      {alphabet.split('').map(letter => {
        const isUsed = usedLetters.includes(letter);
        const isCorrect = correctLetters.includes(letter);
        const isWrong = isUsed && !isCorrect;
        
        return (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={isUsed}
            className={`
              px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200
              ${isCorrect ? 'bg-green-500 text-white' : 
                isWrong ? 'bg-red-500 text-white' : 
                isUsed ? 'bg-gray-400 text-gray-600 cursor-not-allowed' :
                'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'}
            `}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

const WordDisplay = ({ word, guessedLetters }) => {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {word.split('').map((letter, index) => (
        <span
          key={index}
          className="text-4xl font-bold text-white border-b-4 border-white pb-2 w-12 text-center"
        >
          {guessedLetters.includes(letter) ? letter : '_'}
        </span>
      ))}
    </div>
  );
};

const GameStatus = ({ gameState, word, wrongGuesses }) => {
  if (gameState === 'playing') return null;
  
  return (
    <div className={`text-center p-6 rounded-lg ${
      gameState === 'won' ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="text-white">
        {gameState === 'won' ? (
          <>
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">🎉 PARABÉNS! 🎉</h2>
            <p className="text-xl">Você adivinhou a palavra!</p>
          </>
        ) : (
          <>
            <Skull className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">😵 GAME OVER 😵</h2>
            <p className="text-xl mb-2">A palavra era:</p>
            <p className="text-2xl font-bold">{word}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default function HangmanGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'

  const initializeGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState('playing');
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (currentWord && gameState === 'playing') {
      const wordLetters = new Set(currentWord.split(''));
      const guessedWordLetters = new Set(guessedLetters.filter(letter => wordLetters.has(letter)));
      
      if (wordLetters.size === guessedWordLetters.size) {
        setGameState('won');
      } else if (wrongGuesses >= MAX_WRONG_GUESSES) {
        setGameState('lost');
      }
    }
  }, [currentWord, guessedLetters, wrongGuesses, gameState]);

  const handleLetterGuess = (letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) {
      return;
    }

    setGuessedLetters(prev => [...prev, letter]);

    if (!currentWord.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const handleKeyPress = useCallback((event) => {
    const letter = event.key.toUpperCase();
    if (letter.match(/[A-Z]/) && letter.length === 1) {
      handleLetterGuess(letter);
    }
  }, [gameState, guessedLetters, currentWord]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const correctLetters = guessedLetters.filter(letter => currentWord.includes(letter));
  const wrongLetters = guessedLetters.filter(letter => !currentWord.includes(letter));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎯 JOGO DA FORCA 🎯
          </h1>
          <p className="text-xl text-blue-200">
            Adivinhe a palavra antes que o boneco seja enforcado!
          </p>
        </div>

        {/* Game Stats */}
        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center text-white">
            <div className="text-center">
              <p className="text-lg font-semibold">Tentativas Restantes</p>
              <p className="text-3xl font-bold text-yellow-400">
                {MAX_WRONG_GUESSES - wrongGuesses}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Letras Corretas</p>
              <p className="text-3xl font-bold text-green-400">
                {correctLetters.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Letras Erradas</p>
              <p className="text-3xl font-bold text-red-400">
                {wrongLetters.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Hangman Drawing */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Forca
            </h3>
            <HangmanDrawing wrongGuessCount={wrongGuesses} />
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            {/* Word Display */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white text-center mb-6">
                Palavra
              </h3>
              <WordDisplay word={currentWord} guessedLetters={guessedLetters} />
            </div>

            {/* Used Letters */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <h4 className="text-lg font-bold text-white mb-3">Letras Utilizadas:</h4>
              <div className="flex gap-2 flex-wrap">
                {correctLetters.map(letter => (
                  <span
                    key={`correct-${letter}`}
                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold"
                  >
                    {letter}
                  </span>
                ))}
                {wrongLetters.map(letter => (
                  <span
                    key={`wrong-${letter}`}
                    className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="my-8">
          <GameStatus gameState={gameState} word={currentWord} wrongGuesses={wrongGuesses} />
        </div>

        {/* Keyboard */}
        <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Teclado Virtual
          </h3>
          <Keyboard
            onLetterClick={handleLetterGuess}
            usedLetters={guessedLetters}
            correctLetters={correctLetters}
          />
          <p className="text-center text-blue-200 mt-4 text-sm">
            💡 Dica: Você também pode usar o teclado físico!
          </p>
        </div>

        {/* Restart Button */}
        <div className="text-center">
          <button
            onClick={initializeGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          >
            <RefreshCw className="w-6 h-6" />
            Novo Jogo
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Como Jogar:</h3>
          <ul className="text-blue-200 space-y-2">
            <li>🎯 Adivinhe a palavra letra por letra</li>
            <li>✅ Letras corretas aparecem na palavra</li>
            <li>❌ Letras erradas desenham o boneco na forca</li>
            <li>🏆 Ganhe descobrindo a palavra completa</li>
            <li>💀 Perca se o boneco for completamente desenhado</li>
            <li>⌨️ Use o teclado virtual ou físico para jogar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
