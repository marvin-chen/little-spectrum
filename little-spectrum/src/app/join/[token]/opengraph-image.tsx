import { ImageResponse } from "next/og";
import { COLOR_HEX } from "@/lib/colors";
import { getInviteInfo } from "@/lib/data/gardens";
import { parseAvatar } from "@/lib/avatars";
import { GAMES } from "@/lib/games";
import { hourIn, skyFor, themeFor } from "@/lib/themes";

export const runtime = "nodejs";
export const alt = "An invitation to a Little Spectrum garden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#f5f1ea";
const INK = "#141221";
const INK_2 = "#5a5566";

// The link preview that chat apps show for an invite. Painted with simple boxes so it renders anywhere.
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await getInviteInfo(token);
  if (info.status === "invalid") {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CANVAS,
          color: INK,
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        This invite link has wilted
      </div>,
      size,
    );
  }
  const theme = themeFor(info.theme);
  const sky = skyFor(theme, hourIn(info.timezone));
  const accent = info.card.accent === "theme" ? theme.tint : COLOR_HEX[info.card.accent];
  const spotsLeft = Math.max(0, info.capacity - info.memberCount);
  const sticker = info.card.sticker !== "none" ? GAMES[info.card.sticker] : null;
  const avatars = info.card.showMembers ? info.members.slice(0, 8) : [];

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: CANVAS, fontFamily: "sans-serif" }}>
      {info.card.showGarden ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 60%)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -200,
              top: 330,
              width: 1000,
              height: 420,
              borderRadius: 500,
              background: theme.hillBack,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 520,
              top: 380,
              width: 1100,
              height: 420,
              borderRadius: 550,
              background: theme.hillFront,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 470,
              width: 1200,
              height: 200,
              background: theme.ground,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 70,
              width: 110,
              height: 110,
              borderRadius: 55,
              background: sky.sun,
              display: "flex",
              boxShadow: `0 0 80px 30px ${sky.sun}66`,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: `linear-gradient(160deg, ${sky.top}, ${sky.bottom})`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 64,
          right: 64,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          borderRadius: 40,
          background: "rgba(255,255,255,0.86)",
          boxShadow: "0 20px 60px rgba(20,18,33,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: accent,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {info.gardenName}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontSize: 64,
                fontWeight: 800,
                color: INK,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                maxWidth: 900,
              }}
            >
              {info.card.headline}
            </div>
            {info.card.note ? (
              <div
                style={{ display: "flex", marginTop: 18, fontSize: 30, color: INK_2, maxWidth: 880, lineHeight: 1.3 }}
              >
                {info.card.note}
              </div>
            ) : null}
          </div>
          {sticker ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 112,
                height: 112,
                borderRadius: 30,
                background: `linear-gradient(180deg, ${COLOR_HEX[sticker.color]}cc, ${COLOR_HEX[sticker.color]})`,
                color: "white",
                fontSize: 20,
                fontWeight: 700,
                textAlign: "center",
                padding: 10,
                boxShadow: "0 10px 24px rgba(20,18,33,0.2)",
              }}
            >
              {sticker.name}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {avatars.map((m, i) => {
              const parsed = parseAvatar(m.avatar);
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    marginLeft: i === 0 ? 0 : -14,
                    background: COLOR_HEX[parsed.color],
                    color: "white",
                    fontSize: 28,
                    fontWeight: 700,
                    border: "4px solid white",
                  }}
                >
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
              );
            })}
            {avatars.length > 0 ? (
              <div style={{ display: "flex", marginLeft: 18, fontSize: 26, color: INK_2 }}>
                {avatars
                  .map((m) => m.name)
                  .slice(0, 3)
                  .join(", ")}
                {avatars.length > 3 ? ` and ${avatars.length - 3} more` : ""}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 700, color: INK_2 }}>
            <div
              style={{
                display: "flex",
                width: 28,
                height: 28,
                borderRadius: 14,
                marginRight: 12,
                background: `linear-gradient(135deg, ${COLOR_HEX.coral} 0%, ${COLOR_HEX.amber} 25%, ${COLOR_HEX.green} 50%, ${COLOR_HEX.blue} 75%, ${COLOR_HEX.violet} 100%)`,
              }}
            />
            {spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`} · Little Spectrum
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
