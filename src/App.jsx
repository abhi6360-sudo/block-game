import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Define color palette similar to the screenshot
const COLORS = {
  orange: '#FFA500',
  red: '#FF4500',
  blue: '#1E90FF',
  green: '#32CD32',
  purple: '#9370DB',
  cyan: '#00CED1',
  yellow: '#FFD700',
};

// Define block shapes (similar to the ones in screenshot)
const blockShapes = [
  // Single block
  {
    id: 'single',
    shape: [
      [1]
    ],
    width: 1,
    height: 1
  },
  // 2x1 horizontal
  {
    id: 'horizontal2',
    shape: [
      [1, 1]
    ],
    width: 2,
    height: 1
  },
  // 3x1 horizontal
  {
    id: 'horizontal3',
    shape: [
      [1, 1, 1]
    ],
    width: 3,
    height: 1
  },
  // 1x2 vertical
  {
    id: 'vertical2',
    shape: [
      [1],
      [1]
    ],
    width: 1,
    height: 2
  },
  // 1x3 vertical
  {
    id: 'vertical3',
    shape: [
      [1],
      [1],
      [1]
    ],
    width: 1,
    height: 3
  },
  // 2x2 square
  {
    id: 'square',
    shape: [
      [1, 1],
      [1, 1]
    ],
    width: 2,
    height: 2
  },
  // L shape
  {
    id: 'lShape',
    shape: [
      [1, 0],
      [1, 1]
    ],
    width: 2,
    height: 2
  },
  // Reversed L shape
  {
    id: 'reversedL',
    shape: [
      [0, 1],
      [1, 1]
    ],
    width: 2,
    height: 2
  },
  // T shape
  {
    id: 'tShape',
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    width: 3,
    height: 2
  }
];

// Generate a random block
const generateRandomBlock = () => {
  const shape = blockShapes[Math.floor(Math.random() * blockShapes.length)];
  const colorKeys = Object.keys(COLORS);
  const color = COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
  
  return {
    ...shape,
    color,
    key: `${shape.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };
};

// Block component
const Block = ({ block, index, onUseBlock }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { block, index },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.placed) {
        onUseBlock(index);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  return (
    <div 
      ref={drag}
      className="m-2 cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="grid" style={{ 
        gridTemplateColumns: `repeat(${block.width}, 1fr)`,
        gridTemplateRows: `repeat(${block.height}, 1fr)` 
      }}>
        {block.shape.flat().map((cell, i) => (
          <div 
            key={i}
            className={`w-10 h-10 border border-black ${cell ? '' : 'opacity-0'}`}
            style={{ 
              backgroundColor: cell ? block.color : 'transparent',
              boxShadow: cell ? 'inset 2px 2px 5px rgba(255,255,255,0.5), inset -2px -2px 5px rgba(0,0,0,0.5)' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Grid Cell component
const GridCell = ({ row, col, value, onCellHover, onCellDrop, isClearing }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'BLOCK',
    hover: (item) => {
      onCellHover(item.block, row, col);
    },
    drop: (item) => {
      const result = onCellDrop(item.block, row, col);
      return { placed: result };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  // Style for the cell
  let cellStyle = {
    backgroundColor: value ? value : '#1A2456',
    boxShadow: value ? 'inset 2px 2px 5px rgba(255,255,255,0.5), inset -2px -2px 5px rgba(0,0,0,0.5)' : 'none',
    transition: 'all 0.3s ease'
  };

  // Add animation for clearing cells
  if (isClearing && value) {
    cellStyle = {
      ...cellStyle,
      animation: 'pulse 0.5s ease-in-out',
      backgroundColor: '#FFF',
      opacity: 0,
    };
  }

  return (
    <div
      ref={drop}
      className="w-10 h-10 border border-gray-800"
      style={cellStyle}
    />
  );
};

// Score Flash Animation Component
const ScoreFlash = ({ points, position, onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div 
      className="absolute text-2xl font-bold text-yellow-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        animation: 'scoreFloat 1s ease-out forwards',
        zIndex: 10,
        textShadow: '0 0 5px #FF0, 0 0 10px #FF0'
      }}
    >
      +{points}
    </div>
  );
};

// Restart Button Component
const RestartButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-300 flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
      Restart
    </button>
  );
};

// Main App Component
const App = () => {
  // Grid size (9x9 in the screenshot)
  const GRID_SIZE = 9;
  
  // Initialize empty grid
  const emptyGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
  
  // State
  const [grid, setGrid] = useState(emptyGrid);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [previewGrid, setPreviewGrid] = useState(null);
  const [isValidPlacement, setIsValidPlacement] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clearingLines, setClearingLines] = useState({ rows: [], cols: [] });
  const [scoreFlashes, setScoreFlashes] = useState([]);
  const gridRef = useRef(null);

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('blockPuzzleHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(0); opacity: 0; }
      }
      
      @keyframes scoreFloat {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
      }
      
      html, body, #root {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      
      .game-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #3A4A9F;
        overflow: auto;
      }

      .score-meter {
        display: inline-block;
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 10px;
      }

      .score-meter__circle {
        stroke-dasharray: 283;
        stroke-dashoffset: 283;
        transition: stroke-dashoffset 1s ease;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
      }
      
      .score-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize game
  useEffect(() => {
    startGame();
  }, []);

  // Update high score whenever score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('blockPuzzleHighScore', score.toString());
    }
  }, [score, highScore]);

  // Start new game
  const startGame = () => {
    setGrid(emptyGrid);
    setScore(0);
    generateNewBlocks();
  };

  // Generate new blocks
  const generateNewBlocks = () => {
    setAvailableBlocks(Array(2).fill().map(() => generateRandomBlock()));
  };

  // Replace used block
  const handleUseBlock = (index) => {
    setAvailableBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks[index] = generateRandomBlock();
      return newBlocks;
    });
  };

  // Check if block can be placed
  const canPlaceBlock = (block, startRow, startCol) => {
    if (!block) return false;
    
    const { shape } = block;
    
    for (let rowIdx = 0; rowIdx < shape.length; rowIdx++) {
      for (let colIdx = 0; colIdx < shape[rowIdx].length; colIdx++) {
        if (shape[rowIdx][colIdx]) {
          const gridRow = startRow + rowIdx;
          const gridCol = startCol + colIdx;
          
          // Check if out of bounds
          if (gridRow >= GRID_SIZE || gridCol >= GRID_SIZE) {
            return false;
          }
          
          // Check if cell is already occupied
          if (grid[gridRow][gridCol] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Create preview grid when hovering with a block
  const handleCellHover = (block, startRow, startCol) => {
    if (!block) return;
    
    const tempGrid = grid.map(row => [...row]);
    const { shape, color } = block;
    const isValid = canPlaceBlock(block, startRow, startCol);
    
    // Add preview cells
    for (let rowIdx = 0; rowIdx < shape.length; rowIdx++) {
      for (let colIdx = 0; colIdx < shape[rowIdx].length; colIdx++) {
        if (shape[rowIdx][colIdx]) {
          const gridRow = startRow + rowIdx;
          const gridCol = startCol + colIdx;
          
          if (gridRow < GRID_SIZE && gridCol < GRID_SIZE) {
            // Preview color with transparency
            const previewColor = isValid ? 
              color + '80' : // 50% transparency for valid placement
              '#FF0000' + '80'; // Red with transparency for invalid
            
            if (tempGrid[gridRow][gridCol] === null) {
              tempGrid[gridRow][gridCol] = previewColor;
            }
          }
        }
      }
    }
    
    setPreviewGrid(tempGrid);
    setIsValidPlacement(isValid);
  };

  // Handle dropping a block on the grid
  const handleCellDrop = (block, startRow, startCol) => {
    if (!canPlaceBlock(block, startRow, startCol)) {
      setPreviewGrid(null);
      return false;
    }
    
    const newGrid = grid.map(row => [...row]);
    const { shape, color } = block;
    let blockSize = 0;
    
    // Place the block on the grid
    for (let rowIdx = 0; rowIdx < shape.length; rowIdx++) {
      for (let colIdx = 0; colIdx < shape[rowIdx].length; colIdx++) {
        if (shape[rowIdx][colIdx]) {
          const gridRow = startRow + rowIdx;
          const gridCol = startCol + colIdx;
          newGrid[gridRow][gridCol] = color;
          blockSize++;
        }
      }
    }
    
    setGrid(newGrid);
    setPreviewGrid(null);
    
    // Update score for placing the block
    setScore(prev => prev + (blockSize * 10));
    
    // Check for completed rows and columns immediately
    checkCompletedLines(newGrid);
    
    return true;
  };

  // Check and clear completed rows and columns with animation
  const checkCompletedLines = (currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);
    const completedRows = [];
    const completedCols = [];
    
    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
      if (newGrid[row].every(cell => cell !== null)) {
        completedRows.push(row);
      }
    }
    
    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
      let columnFull = true;
      for (let row = 0; row < GRID_SIZE; row++) {
        if (newGrid[row][col] === null) {
          columnFull = false;
          break;
        }
      }
      
      if (columnFull) {
        completedCols.push(col);
      }
    }
    
    const totalLinesCleared = completedRows.length + completedCols.length;
    
    if (totalLinesCleared > 0) {
      // Show clearing animation
      setClearingLines({ rows: completedRows, cols: completedCols });
      
      // Calculate score increase
      const additionalPoints = totalLinesCleared * 50;
      
      // Show score flash animation if grid ref is available
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2 - 20,
          y: rect.top - 30
        };
        
        const newFlash = {
          id: Date.now(),
          points: additionalPoints,
          position
        };
        
        setScoreFlashes(prev => [...prev, newFlash]);
      }
      
      // Update score
      setScore(prev => prev + additionalPoints);
      
      // Wait for animation to complete before clearing cells
      setTimeout(() => {
        // Clear the completed lines
        const finalGrid = newGrid.map(row => [...row]);
        
        // Clear rows
        completedRows.forEach(row => {
          finalGrid[row] = Array(GRID_SIZE).fill(null);
        });
        
        // Clear columns
        completedCols.forEach(col => {
          for (let row = 0; row < GRID_SIZE; row++) {
            finalGrid[row][col] = null;
          }
        });
        
        setGrid(finalGrid);
        setClearingLines({ rows: [], cols: [] });
      }, 600);
    }
  };

  // Handle score flash animation end
  const handleScoreFlashEnd = (id) => {
    setScoreFlashes(prev => prev.filter(flash => flash.id !== id));
  };

  // Handle mouse leave to clear preview
  const handleMouseLeave = () => {
    setPreviewGrid(null);
  };

  // Check if a cell is part of a clearing line
  const isCellClearing = (row, col) => {
    return clearingLines.rows.includes(row) || clearingLines.cols.includes(col);
  };

  // Calculate the stroke dash offset for score meters
  const getScoreMeterOffset = (value, maxValue) => {
    const percentage = Math.min(value / maxValue, 1);
    return 283 - (percentage * 283);
  };

  // Handle restart button click
  const handleRestart = () => {
    // Confirm before restarting
    if (window.confirm('Are you sure you want to restart the game?')) {
      startGame();
    }
  };

  // Use the actual grid or preview grid for rendering
  const displayGrid = previewGrid || grid;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="game-container">
        <div className="flex flex-col items-center justify-center">
          {/* Score display with high score and current score meters */}
          <div className="flex justify-between items-center mb-6 w-full relative px-4">
            <div className="flex items-center">
              {/* Current Score Meter */}
              <div className="score-meter">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#333" strokeWidth="10" />
                  <circle 
                    className="score-meter__circle" 
                    cx="60" 
                    cy="60" 
                    r="45" 
                    fill="none" 
                    stroke="#FFD700" 
                    strokeWidth="10" 
                    style={{ strokeDashoffset: getScoreMeterOffset(score, 1000) }}
                  />
                </svg>
                <div className="score-label">
                  <div className="text-lg font-bold text-white">Score</div>
                  <div className="text-2xl font-bold text-yellow-300">{score}</div>
                </div>
              </div>
              
              {/* High Score Meter */}
              <div className="score-meter">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#333" strokeWidth="10" />
                  <circle 
                    className="score-meter__circle" 
                    cx="60" 
                    cy="60" 
                    r="45" 
                    fill="none" 
                    stroke="#FF4500" 
                    strokeWidth="10" 
                    style={{ strokeDashoffset: getScoreMeterOffset(highScore, 1000) }}
                  />
                </svg>
                <div className="score-label">
                  <div className="text-lg font-bold text-white">High Score</div>
                  <div className="text-2xl font-bold text-red-500">{highScore}</div>
                </div>
              </div>
            </div>
            
            {/* Restart Button */}
            <div className="absolute right-4 top-0">
              <RestartButton onClick={handleRestart} />
            </div>
            
            {/* Score flash animations */}
            {scoreFlashes.map(flash => (
              <ScoreFlash 
                key={flash.id}
                points={flash.points}
                position={flash.position}
                onAnimationEnd={() => handleScoreFlashEnd(flash.id)}
              />
            ))}
          </div>
          
          {/* Game board */}
          <div 
            ref={gridRef}
            className="grid grid-cols-9 border-4 border-gray-800 rounded bg-gray-800 mb-6 relative shadow-2xl"
            onMouseLeave={handleMouseLeave}
          >
            {displayGrid.map((row, rowIdx) => (
              row.map((cell, colIdx) => (
                <GridCell 
                  key={`${rowIdx}-${colIdx}`} 
                  row={rowIdx} 
                  col={colIdx} 
                  value={cell}
                  onCellHover={handleCellHover}
                  onCellDrop={handleCellDrop}
                  isClearing={isCellClearing(rowIdx, colIdx)}
                />
              ))
            ))}
          </div>
          
          {/* Block selection panel */}
          <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-start shadow-xl">
            {availableBlocks.map((block, index) => (
              <Block 
                key={block.key} 
                block={block} 
                index={index} 
                onUseBlock={handleUseBlock}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;