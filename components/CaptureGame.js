window.CaptureGame = ({ 
    difficulty, 
    pokemonId, 
    normalBalls, 
    superBalls, 
    onSuccess, 
    onFailure, 
    onClose 
  }) => {
    const [gameState, setGameState] = React.useState({
      pokemonY: 150,
      ballX: 100,
      ballY: 450,
      isBallFlying: false,
      moveDirection: 1,
      selectedBall: null,
      gameActive: true
    });
    
    const [captureState, setCaptureState] = React.useState({
      isCapturing: false,
      captureSuccess: false,
      showResult: false
    });
  
    const canvasRef = React.useRef(null);
    const animationRef = React.useRef(null);
  
    React.useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
  
      const animate = () => {
        if (gameState.gameActive) {
          // 清除畫布
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 繪製背景
          ctx.fillStyle = '#1a365d';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // 繪製寶可夢
          const pokemonImg = new Image();
          pokemonImg.src = `./pokemon/${String(pokemonId).padStart(3, '0')}.gif`;
          ctx.drawImage(pokemonImg, 450, gameState.pokemonY - 25, 50, 50);
  
          // 如果球在飛行中，繪製球
          if (gameState.isBallFlying) {
            const ballImg = new Image();
            ballImg.src = `./img/${gameState.selectedBall === 'super' ? 'super' : 'normal'}.png`;
            ctx.drawImage(ballImg, gameState.ballX, gameState.ballY, 30, 30);
          }
  
          // 更新寶可夢位置
          setGameState(prev => {
            const newY = prev.pokemonY + (prev.moveDirection * (3 + difficulty * 0.5));
            return {
              ...prev,
              pokemonY: newY > 300 || newY < 50 ? prev.pokemonY : newY,
              moveDirection: newY > 300 || newY < 50 ? -prev.moveDirection : prev.moveDirection
            };
          });
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
  
      animationRef.current = requestAnimationFrame(animate);
  
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [difficulty, gameState.gameActive, pokemonId]);
  
    const throwBall = (type) => {
      if (type === 'normal' && normalBalls <= 0) {
        alert('精靈球不足！');
        return;
      }
      if (type === 'super' && superBalls <= 0) {
        alert('大師球不足！');
        return;
      }
  
      setGameState(prev => ({
        ...prev,
        isBallFlying: true,
        selectedBall: type,
        ballX: 100,
        ballY: 450
      }));
  
      const animateBall = () => {
        setGameState(prev => {
          const newX = prev.ballX + 5;
          const newY = prev.ballY - 5;
  
          // 檢查碰撞
          if (newX > 450 && Math.abs(newY - prev.pokemonY) < 50) {
            // 設定捕捉動畫
            setCaptureState({
              isCapturing: true,
              captureSuccess: Math.random() < (type === 'super' ? 0.9 : 0.7),
              showResult: false
            });
  
            setTimeout(() => {
              setCaptureState(prev => ({ ...prev, showResult: true }));
              setTimeout(() => {
                if (prev.captureSuccess) {
                  onSuccess();
                } else {
                  onFailure();
                }
              }, 2000);
            }, 1500);
  
            return { ...prev, gameActive: false, isBallFlying: false };
          }
  
          // 球飛過寶可夢
          if (newX > 600) {
            onFailure();
            return { ...prev, isBallFlying: false };
          }
  
          requestAnimationFrame(animateBall);
          return { ...prev, ballX: newX, ballY: newY };
        });
      };
  
      requestAnimationFrame(animateBall);
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              width="600" 
              height="500" 
              className="border-2 border-slate-600 rounded-lg"
            />
            
            {captureState.isCapturing && !captureState.showResult && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="./gif/catching.gif" 
                  className="w-32 h-32"
                  alt="Catching animation"
                />
              </div>
            )}
            
            {captureState.showResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center">
                  <img 
                    src={`./pokemon/${String(pokemonId).padStart(3, '0')}.gif`}
                    className="w-32 h-32 mx-auto mb-4"
                    alt="Pokemon"
                  />
                  <h2 className="text-3xl font-bold mb-4 text-white">
                    {captureState.captureSuccess ? '捕捉成功！' : '捕捉失敗！'}
                  </h2>
                </div>
              </div>
            )}
          </div>
  
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => throwBall('normal')}
              disabled={gameState.isBallFlying || normalBalls === 0}
              className="flex flex-col items-center"
            >
              <img 
                src="./img/normal.png" 
                className="w-16 h-16 hover:scale-110 transition-transform" 
                alt="Normal ball"
              />
              <span className="text-white mt-2">精靈球 ({normalBalls})</span>
            </button>
            
            <button
              onClick={() => throwBall('super')}
              disabled={gameState.isBallFlying || superBalls === 0}
              className="flex flex-col items-center"
            >
              <img 
                src="./img/super.png" 
                className="w-16 h-16 hover:scale-110 transition-transform" 
                alt="Super ball"
              />
              <span className="text-white mt-2">大師球 ({superBalls})</span>
            </button>
          </div>
  
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-full"
          >
            關閉
          </button>
        </div>
      </div>
    );
  };
  
  export default CaptureGame;