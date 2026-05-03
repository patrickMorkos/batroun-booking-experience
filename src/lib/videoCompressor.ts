export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void
): Promise<File> {
  const maxWidth = 1280;
  const maxHeight = 720;
  const videoBitrate = 2_500_000;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video"));
  });

  const duration = video.duration;
  if (!duration || !isFinite(duration)) {
    return file;
  }

  let width = video.videoWidth;
  let height = video.videoHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  width = width % 2 === 0 ? width : width - 1;
  height = height % 2 === 0 ? height : height - 1;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(30);

  try {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  } catch {
    // no audio track — that's fine
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : "video/webm";

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: videoBitrate,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
    };
  });

  recorder.start(100);
  video.currentTime = 0;
  await video.play();

  await new Promise<void>((resolve) => {
    const draw = () => {
      if (video.ended || video.paused) {
        recorder.stop();
        resolve();
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      if (onProgress && duration) {
        onProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
      }
      requestAnimationFrame(draw);
    };
    video.onended = () => {
      recorder.stop();
      resolve();
    };
    draw();
  });

  const blob = await done;
  URL.revokeObjectURL(video.src);

  onProgress?.(100);

  const ext = mimeType.includes("webm") ? "webm" : "mp4";
  const newName = file.name.replace(/\.[^.]+$/, `.${ext}`);
  return new File([blob], newName, { type: blob.type });
}
