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
) => {
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
};

const ListPlayer = () => {
    const socket = useSocket();
    const {currentUser, changeWallet} = useUserStore();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const duckImagesRef = useRef<HTMLImageElement[]>([]);
    const backgroundImageRef1 = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
    const backgroundImageRef2 = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
    const backgroundImageRef3 = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
    const endGameLineRef = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
    const startGameLineRef = useRef<HTMLImageElement | null>(null); // Lưu hình ảnh nền
    const background1Position = useRef<number>(0); // Lưu vị trí của background 1
    const background2Position = useRef<number>(0); // Lưu vị trí của background 2
    const endGameLinePosition = useRef<number | null>(null); // Lưu vị trí của background 2
    const startGameLinePosition = useRef<number | null>(null); // Lưu vị trí của background 2
    const lastFrameTimeRef = useRef<number>(0);
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

    const {isRacing, setGameResult, gameResult, maxScore, raceProgress} =
        useGameStore();

    const playersRef = useRef(players);
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    const raceProgressRef = useRef(raceProgress);
    useEffect(() => {
        raceProgressRef.current = raceProgress;
    }, [raceProgress]);

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
                    gameResult.winners?.length === 0 &&
                    gameResult.bettors?.includes(currentUser?.id ?? "");
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
        backgroundImage1.src = "/bg-4.1.PNG"; // Đường dẫn tới hình ảnh nền
        backgroundImageRef1.current = backgroundImage1;

        const backgroundImage2 = new Image();
        backgroundImage2.src = "/bg-5.1.PNG"; // Đường dẫn tới hình ảnh nền
        backgroundImageRef2.current = backgroundImage2;

        const backgroundImage3 = new Image();
        backgroundImage3.src = "/bg-5.2.PNG"; // Đường dẫn tới hình ảnh nền
        backgroundImageRef3.current = backgroundImage3;

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

        const startX = 50;
        const endX = canvas.width - 200 - 100;
        const raceDistance = endX - startX;

        const currentPlayerIds = new Set<string>();
        players.forEach((player) => {
            // player.id is the unique identifier
            const playerId = player.id;
            if (!playerId) return;
            currentPlayerIds.add(playerId);

            const duckPosition = duckPositionsRef.current.get(playerId) || {
                x: 50,
                y: 0, // Y position is determined by index in the render loop
                posStart: 50,
                posEnd: 50,
                duckIcon: player.colorNumber,
            };

            if (maxScore && maxScore > 0) {
                duckPosition.posStart =
                    startX + (player.score.oldScore / maxScore) * raceDistance;
                duckPosition.posEnd =
                    startX + (player.score.totalScore / maxScore) * raceDistance;
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
            background1Position.current = 0;
            background2Position.current = canvas.width;
        };
        resizeWindow(); // Gọi hàm resizeWindow khi component được mount
        window.addEventListener("resize", resizeWindow); // Gọi hàm resizeWindow khi kích thước cửa sổ thay đổi

        let animationFrameId: number;

        const animateDucks = (currentTime: number) => {
            if (lastFrameTimeRef.current === 0) {
                lastFrameTimeRef.current = currentTime;
                animationFrameId = requestAnimationFrame(animateDucks);
                return;
            }
            const deltaTime = currentTime - lastFrameTimeRef.current;
            lastFrameTimeRef.current = currentTime;

            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw static background
            if (backgroundImageRef1.current) {
                context.drawImage(
                    backgroundImageRef1.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
            }

            // Animate and draw scrolling water
            const backgroundSpeed = 50; // Pixels per second
            const distanceMoved = (backgroundSpeed * deltaTime) / 300;
            let waterX1 = background1Position.current - distanceMoved;
            let waterX2 = background2Position.current - distanceMoved;

            // When an image moves off-screen to the left, reset its position to the far right
            if (waterX1 < -canvas.width) {
                waterX1 += canvas.width * 2;
            }
            if (waterX2 < -canvas.width) {
                waterX2 += canvas.width * 2;
            }

            if (backgroundImageRef2.current && backgroundImageRef3.current) {
                context.drawImage(
                    backgroundImageRef2.current,
                    waterX1,
                    0,
                    canvas.width,
                    canvas.height,
                );
                context.drawImage(
                    backgroundImageRef3.current,
                    waterX2,
                    0,
                    canvas.width,
                    canvas.height,
                );
            }

            background1Position.current = waterX1;
            background2Position.current = waterX2;

            const topOffset = canvas.height / 3.5; // Relative top offset to avoid modals
            const bottomOffset = canvas.height / 6; // Relative space at the bottom
            const availableHeight = canvas.height - topOffset - bottomOffset;
            const waterHeight = canvas.height - topOffset - 5;
            if (
                raceProgressRef.current.maxTurns > 0 &&
                raceProgressRef.current.turn >= raceProgressRef.current.maxTurns - 3
            ) {
                isEndGameRef.current = true;
            }

            if (endGameLineRef.current && isEndGameRef.current) {
                // 1. Bắt đầu từ ngoài màn hình
                let endGameLineX =
                    (endGameLinePosition.current ?? canvas.width + 200) - 1; // Tăng tốc độ

                // 2. Xác định vị trí dừng (khớp với vị trí logic vịt dừng)
                const stopPosition = canvas.width - 200;

                // 3. Clamp vị trí TRƯỚC KHI VẼ
                if (endGameLineX <= stopPosition) {
                    endGameLineX = stopPosition;
                }

                // 4. Vẽ
                context.save();
                context.setTransform(1, 0, -0.1, 1, 0, 0);
                context.drawImage(
                    endGameLineRef.current,
                    endGameLineX + 100,
                    topOffset,
                    30,
                    waterHeight,
                );
                context.restore();

                // 5. Lưu lại vị trí
                endGameLinePosition.current = endGameLineX;
            }
            if (startGameLineRef.current) {
                let startGameLineX = (startGameLinePosition.current ?? 250) - 0.5;
                context.save();
                context.setTransform(1, 0, -0.3, 1, 0, 0);
                context.drawImage(
                    startGameLineRef.current,
                    startGameLineX + 100,
                    topOffset,
                    30,
                    waterHeight,
                );
                if (startGameLineX <= 250 && !isRacingRef.current)
                    startGameLineX = 250;
                startGameLinePosition.current = startGameLineX;
                context.restore();
            }
            // Nội suy vị trí của vịt trong mỗi khung hình
            const elapsedTime = (Date.now() - kickstartTimeRef.current) / 1000; // thời gian trôi qua trong giây
            const interpolationFactor = Math.min(elapsedTime, 1.0); // không vượt quá 1
            let completedGameCount = 0;
            const spacing =
                totalPlayerRef.current > 1
                    ? availableHeight / (totalPlayerRef.current - 1)
                    : 0;

            const stablePlayers = [...playersRef.current].sort(
                (a, b) => b.order - a.order,
            );

            stablePlayers.forEach((player, index) => {
                if (!player.id) return;
                const duckPosition = duckPositionsRef.current.get(player.id);
                if (!duckPosition) return;

                if (isRacingRef.current) {
                    // Nội suy vị trí X
                    duckPosition.x =
                        duckPosition.posStart +
                        (duckPosition.posEnd - duckPosition.posStart) * interpolationFactor;
                }

                // New Y position calculation based on the current array index
                duckPosition.y = topOffset + index * spacing; // Vị trí Y CƠ BẢN

                if (duckPosition.x >= canvas.width - 300) {
                    completedGameCount++;
                    duckPosition.x = canvas.width - 300;
                }
                if (resetGameRef.current) {
                    duckPosition.x = 5;
                }

                // --- BẮT ĐẦU HIỆU ỨNG DẬP DÌU ---
                const bobbingAmplitude = 4; // Biên độ: Vịt sẽ nhô lên/hạ xuống 4px
                const bobbingSpeed = 400; // Tốc độ dập dìu (số càng lớn, càng chậm)
                const phase = index * 0.5; // Pha: Giúp các con vịt dập dìu LỆCH NHAU

                // currentTime được lấy từ tham số của hàm animateDucks
                const bobbingOffset =
                    Math.sin(currentTime / bobbingSpeed + phase) * bobbingAmplitude;

                // Vị trí Y cuối cùng để vẽ con vịt VÀ CÁC THÀNH PHẦN KHÁC CÙNG DẬP DÌU
                const finalDrawY = duckPosition.y + bobbingOffset;
                // --- KẾT THÚC HIỆU ỨNG ---

                // --- TÍNH TOÁN SKEW ĐỘNG ---
                // Logic này tính toán độ nghiêng (skew) một cách linh động dựa trên tiến trình của vịt
                // để khớp với phối cảnh của vạch bắt đầu (-0.3) và vạch đích (-0.1).

                // 1. Xác định các thông số của đường đua
                const startX = 50;
                const endX = canvas.width - 300;
                const raceTrackLength = endX - startX;

                // 2. Tính tỷ lệ hoàn thành đường đua (từ 0 đến 1)
                const progressRatio =
                    raceTrackLength > 0 ? (duckPosition.x - startX) / raceTrackLength : 0;
                const t = Math.max(0, Math.min(1, progressRatio)); // Kẹp giá trị t trong khoảng [0, 1]

                // 3. Nội suy tuyến tính để tìm hệ số skew hiện tại
                const startSkew = -0.3;
                const endSkew = -0.1;
                const currentSkew = startSkew + (endSkew - startSkew) * t;

                // Dùng skew cố định -0.35 khi chưa đua, và skew động khi đang đua.
                const skewToUse = !isRacingRef.current ? -0.35 : currentSkew;

                // 4. Tính toán vị trí X cuối cùng để vẽ, đã bao gồm skew được chọn
                const dynamicSkewOffset = skewToUse * finalDrawY;
                // --- KẾT THÚC TÍNH TOÁN SKEW ĐỘNG ---

                const duckImage = duckImagesRef.current[duckPosition.duckIcon - 1];
                if (duckImage) {
                    context.drawImage(
                        duckImage,
                        duckPosition.x + 200 + dynamicSkewOffset, // Dùng skew động
                        finalDrawY, // Dùng finalDrawY cho Y
                        100,
                        100,
                    );
                }

                // Draw player name in a bubble
                if (
                    player.name == player.user?.display_name
                        ? player.user?.display_name
                        : player && player.name
                ) {
                    context.font = "bold 12px 'DVN-TitanOne', sans-serif";
                    const playerName = player.name;
                    const textMetrics = context.measureText(playerName);
                    const bubbleWidth = textMetrics.width + 20;
                    const bubbleHeight = 24;

                    const bubbleX =
                        duckPosition.x +
                        230 +
                        dynamicSkewOffset + // Dùng skew động
                        30 -
                        bubbleWidth / 2;
                    const bubbleY = finalDrawY - bubbleHeight - 10; // Dùng finalDrawY cho Y

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
                    context.fillText(
                        playerName,
                        duckPosition.x + 230 + dynamicSkewOffset + 30, // Dùng skew động
                        bubbleY + bubbleHeight / 2, // bubbleY đã tính từ finalDrawY
                    );
                }

                context.font = "16px Arial";
                context.fillStyle = "black";
                context.textAlign = "center";
                // Dùng finalDrawY cho số thứ tự để nó dập dìu cùng vịt
                context.fillText(
                    `${player.order}`,
                    duckPosition.x + 200 + dynamicSkewOffset + 55, // Dùng skew động
                    finalDrawY + 73, // Dùng finalDrawY cho Y
                );
            });

            if (
                completedGameCount === totalPlayerRef.current &&
                completedGameCount !== 0
            ) {
                setIsCompletedAll(true);
            }

            animationFrameId = requestAnimationFrame(animateDucks);
        };

        animationFrameId = requestAnimationFrame(animateDucks);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeWindow);
        };
    }, [setIsCompletedAll]);

    return (
        <div className="relative bg-[#21107266] rounded-lg ">
            <canvas
                ref={canvasRef}
                className="border border-gray-500 rounded w-[100vw] h-[100vh] m-0 p-0 block"
            />
        </div>
    );
};

export default ListPlayer;