import {SocketEvents} from "@/constants/SocketEvents";
import {IGameResult} from "@/interface/game/Game";
import {useSocket} from "@/providers/SocketProvider";
import useGameStore from "@/stores/gameStore"; // Giả sử bạn có store để quản lý state
import useRoomStore from "@/stores/roomStore";
import useUserStore from "@/stores/userStore";
import {useEffect, useRef} from "react";

type DuckPixelPosition = {
    x: number;
    y: number;
    posStart: number;
    posEnd: number;
    duckIcon: number;
};

const drawBubble = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
)=> {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

const ListPlayer = () => {
  const socket = useSocket();
  const { currentUser, changeWallet } = useUserStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const duckImagesRef = useRef<HTMLImageElement[]>([]);
  const backgroundImageRef1 = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
  const backgroundImageRef2 = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
  const endGameLineRef = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
  const startGameLineRef = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
  const background1Position = useRef<number>(0); // Lưu vị trí của background 1
  const background2Position = useRef<number>(0); // Lưu vị trí của background 2
  const endGameLinePosition = useRef<number | null>(null); // Lưu vị trí của background 2
  const startGameLinePosition = useRef<number | null>(null); // Lưu vị trí của background 2
  const players = useRoomStore((state) => state.listDucks); // Lấy danh sách player từ store
  const isResetGame = useGameStore((state) => state.isResetGame); // Lấy trạng thái reset vị trí từ store
  const setIsCompletedAll = useGameStore((state) => state.setIsCompletedAll); // Lấy danh sách player từ storeuseGameStore((state) => state.setGameStatus);useRef<boolean>(false);
  const isEndGameRef = useRef<boolean>(false); // Lưu trạng thái kết thúc game
  const isRacingRef = useRef<boolean>(false); // Lưu trạng thái đua của game
  const resetGameRef = useRef<boolean>(false); // Lưu trạng thái reset game
  const gameStatus = useGameStore((state) => state.gameStatus); // Lấy trạng thái game từ store
    const duckPositionsRef = useRef<Map<string, DuckPixelPosition>>(new Map());
    const kickstartTimeRef = useRef<number>(0);
    const totalPlayerRef = useRef<number>(0);

  const { isRacing, setGameResult, gameResult, maxScore, raceProgress } = useGameStore(); // Lấy trạng thái đua của game từ store

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvents.ON.END_GAME_SUCCESS, (data: IGameResult) => {
      setGameResult(data); // Chỉ lưu kết quả, không thay đổi trạng thái game
        console.log("data", data);
    });
    return () => {
      socket.off(SocketEvents.ON.END_GAME_SUCCESS);
    };
  }, [setGameResult, socket]);

  useEffect(() => {
    if (gameStatus === "completed" && gameResult) {
      isEndGameRef.current = true;
      if (currentUser?.wallet !== undefined) {
        const isWinner = gameResult.winners?.includes(currentUser?.id ?? "");
        const isBettorWithNoWinner =
          gameResult.winners?.length === 0 && gameResult.bettors?.includes(currentUser?.id ?? "");
        if (isWinner || isBettorWithNoWinner) {
          changeWallet(currentUser.wallet + gameResult.winBet);
        }
      }
    }
  }, [gameStatus, gameResult, currentUser, changeWallet]);

  useEffect(() => {
    resetGameRef.current = isResetGame;
  }, [isResetGame]);
  // Tải hình ảnh vịt và hình ảnh nền
  useEffect(() => {
    const maxIcons = 10;
    const duckImages: HTMLImageElement[] = [];
    for (let i = 1; i <= maxIcons; i++) {
      const img = new Image();
      img.src = `/duck-${i}.png`;
      duckImages.push(img);
    }
    duckImagesRef.current = duckImages;

    const backgroundImage1 = new Image();
    backgroundImage1.src = "/bg-4.png"; // Đường dẫn tới hình ảnh nền
    backgroundImageRef1.current = backgroundImage1;

    const backgroundImage2 = new Image();
    backgroundImage2.src = "/bg-5.png"; // Đường dẫn tới hình ảnh nền
    backgroundImageRef2.current = backgroundImage2;

    const endGameLineImage = new Image();
    endGameLineImage.src = "/vach-dich.jpg"; // Đường dẫn tới hình ảnh nền
    endGameLineRef.current = endGameLineImage;

    const startGameLineImage = new Image();
    startGameLineImage.src = "/vach-dich.jpg"; // Đường dẫn tới hình ảnh nền
    startGameLineRef.current = startGameLineImage;
  }, []); // Chỉ tải hình ảnh một lần khi component được mount

  // Cập nhật vị trí và tốc độ của vịt mỗi khi players thay đổi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = 5;
    const endX = canvas.width - 100;
    const raceDistance = endX - startX;

    const currentPlayerIds = new Set<string>();
    players.forEach((player) => {
      // player.id is the unique identifier
      const playerId = player.id;
      if (!playerId) return;
      currentPlayerIds.add(playerId);

      const duckPosition = duckPositionsRef.current.get(playerId) || {
        x: 5,
        y: 0, // Y position is determined by index in the render loop
        posStart: 5,
        posEnd: 5,
        duckIcon: player.colorNumber,
      };

      if (maxScore && maxScore > 0) {
        duckPosition.posStart = startX + (player.score.oldScore / maxScore) * raceDistance;
        duckPosition.posEnd = startX + (player.score.totalScore / maxScore) * raceDistance;
      } else {
        duckPosition.posStart = startX;
        duckPosition.posEnd = startX;
      }

      if (!isRacing) {
        duckPosition.x = startX;
      }

      duckPosition.duckIcon = player.colorNumber;
      duckPositionsRef.current.set(playerId, duckPosition);
    });

    // Remove positions for players who have left
    for (const key of duckPositionsRef.current.keys()) {
      if (!currentPlayerIds.has(key)) {
        duckPositionsRef.current.delete(key);
      }
    }

    kickstartTimeRef.current = Date.now();
    totalPlayerRef.current = players.length;
  }, [players, maxScore, isRacing]);

  useEffect(() => {
    if (isRacingRef) {
      isRacingRef.current = isRacing ?? false;
    }
    if (isRacing) {
      setIsCompletedAll(false);
    }
  }, [isRacing, setIsCompletedAll]);
  useEffect(() => {
    if (gameStatus !== "completed") {
      isEndGameRef.current = false;
      endGameLinePosition.current = null;
    }
  }, [gameStatus]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !backgroundImageRef1.current || !canvas) return;
    const ratio = 1;
    const resizeWindow = () => {
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resizeWindow(); // Gọi hàm resizeWindow khi component được mount
    window.addEventListener("resize", resizeWindow); // Gọi hàm resizeWindow khi kích thước cửa sổ thay đổi

    let animationFrameId: number;

    const animateDucks = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const backgroundSpeed = 0.5;
        let background1X = background1Position.current - backgroundSpeed;
        let background2X = background2Position.current - backgroundSpeed;
        if (backgroundImageRef1.current && backgroundImageRef2.current) {
            context.drawImage(backgroundImageRef1.current, background1X, 0, canvas.width + 10, canvas.height);
            context.drawImage(backgroundImageRef2.current, background2X + canvas.width, 0, canvas.width + 10, canvas.height);
        }
        if (background1X <= -canvas.width) background1X = canvas.width;
        if (background2X <= -2 * canvas.width) background2X = 0;
        background1Position.current = background1X;
        background2Position.current = background2X;

        const topOffset = canvas.height / 3.5; // Relative top offset to avoid modals
        const bottomOffset = canvas.height / 10; // Relative space at the bottom
        const availableHeight = canvas.height - topOffset - bottomOffset;

        if (raceProgress.maxTurns > 0 && raceProgress.turn >= raceProgress.maxTurns - 3) {
            isEndGameRef.current = true;
        }

        if (endGameLineRef.current && isEndGameRef.current) {
            let endGameLineX = (endGameLinePosition.current ?? canvas.width) - 0.5;
            context.drawImage(endGameLineRef.current, endGameLineX, canvas.height / 5, 30, canvas.height);
            if (endGameLineX <= canvas.width - canvas.height / 5) {
                endGameLineX = canvas.width - canvas.height / 5;
            }
            endGameLinePosition.current = endGameLineX;
        }
        if (startGameLineRef.current) {
            let startGameLineX = (startGameLinePosition.current ?? 60) - 0.5;
            context.drawImage(startGameLineRef.current, startGameLineX, canvas.height / 5, 30, canvas.height);
            if (startGameLineX <= 60 && !isRacingRef.current) startGameLineX = 60;
            startGameLinePosition.current = startGameLineX;
        }

        // Nội suy vị trí của vịt trong mỗi khung hình
        const elapsedTime = (Date.now() - kickstartTimeRef.current) / 1000; // thời gian trôi qua trong giây
        const interpolationFactor = Math.min(elapsedTime, 1.0); // không vượt quá 1
        let completedGameCount = 0;
        const spacing = totalPlayerRef.current > 1 ? availableHeight / (totalPlayerRef.current - 1) : 0;

        const stablePlayers = [...players].sort((a, b) => b.order - a.order);

        stablePlayers.forEach((player, index) => {
            if (!player.id) return;
            const duckPosition = duckPositionsRef.current.get(player.id);
            if (!duckPosition) return;

            if (isRacingRef.current) {
                // Nội suy vị trí X
                duckPosition.x = duckPosition.posStart + (duckPosition.posEnd - duckPosition.posStart) * interpolationFactor;
            }
            
            // New Y position calculation based on the current array index
            duckPosition.y = topOffset + index * spacing;

            if (duckPosition.x >= canvas.width - 100) {
                completedGameCount++;
                duckPosition.x = canvas.width - 100;
            }
            if (resetGameRef.current) {
                duckPosition.x = 5;
            }

            const duckImage = duckImagesRef.current[duckPosition.duckIcon - 1];
            if (duckImage) {
                context.drawImage(duckImage, duckPosition.x, duckPosition.y, 60, 60);
            }
            
            // Draw player name in a bubble
            if (player && player.name) {
                context.font = "bold 12px 'DVN-TitanOne', sans-serif";
                const playerName = player.name;
                const textMetrics = context.measureText(playerName);
                const bubbleWidth = textMetrics.width + 20;
                const bubbleHeight = 24;
                const bubbleX = duckPosition.x + 30 - bubbleWidth / 2;
                const bubbleY = duckPosition.y - bubbleHeight - 10;

                // Draw the speech bubble
                context.fillStyle = "rgba(255, 255, 255, 0.9)";
                context.strokeStyle = "#4A4A4A";
                context.lineWidth = 1;
                drawBubble(context, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
                context.fill();
                context.stroke();

                // Draw the player name
                context.fillStyle = "#000000";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(playerName, duckPosition.x + 30, bubbleY + bubbleHeight / 2);
            }

            context.font = "12px Arial";
            context.fillStyle = "black";
            context.textAlign = "center";
            context.fillText(`${player.order}`, duckPosition.x + 31, duckPosition.y + 47);
        });

        if (completedGameCount === totalPlayerRef.current && completedGameCount !== 0) {
            setIsCompletedAll(true);
        }

        animationFrameId = requestAnimationFrame(animateDucks);
        };

    animateDucks();

    return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener("resize", resizeWindow);
        };
  }, [setIsCompletedAll, raceProgress, players]);

  return (
    <div className='relative bg-[#21107266] rounded-lg '>
      <canvas ref={canvasRef} className='border border-gray-500 rounded w-[100vw] h-[100vh] m-0 p-0 block' />
    </div>
  );
};

export default ListPlayer;