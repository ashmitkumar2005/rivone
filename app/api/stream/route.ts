export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const fileId = searchParams.get("id")

        console.log("Streaming request for fileId:", fileId)

        if (!fileId) {
            return new Response("missing file id", { status: 400 })
        }

        const token = process.env.BOT_TOKEN
        if (!token) {
            console.error("BOT_TOKEN is missing in environment variables")
            return new Response("BOT_TOKEN missing", { status: 500 })
        }

        console.log("Fetching file metadata from Telegram...")
        const metaRes = await fetch(
            `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
            { cache: "no-store" }
        )

        if (!metaRes.ok) {
            const errorText = await metaRes.text()
            console.error("Telegram getFile API error:", metaRes.status, errorText)
            return new Response(`Telegram getFile failed: ${metaRes.status}`, { status: metaRes.status })
        }

        const meta = await metaRes.json()
        if (!meta.ok || !meta.result?.file_path) {
            console.error("Telegram getFile returned ok:false or no file_path:", meta)
            return new Response("telegram getFile failed", { status: 404 })
        }

        const filePath = meta.result.file_path
        console.log("Fetching actual file from Telegram:", filePath)

        const fileRes = await fetch(
            `https://api.telegram.org/file/bot${token}/${filePath}`,
            { cache: "no-store" }
        )

        if (!fileRes.ok) {
            console.error("Telegram file download error:", fileRes.status)
            return new Response(`Telegram file download failed: ${fileRes.status}`, { status: fileRes.status })
        }

        if (!fileRes.body) {
            console.error("Telegram response body is empty")
            return new Response("empty audio stream", { status: 500 })
        }

        const download = searchParams.get("download") === "true"

        console.log("Streaming audio to client...")
        return new Response(fileRes.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-store",
                "Content-Length": fileRes.headers.get("Content-Length") || "",
                ...(download && {
                    "Content-Disposition": 'attachment; filename="music.mp3"',
                }),
            },
        })
    } catch (error: any) {
        console.error("Internal Server Error in stream route:", error)
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
    }
}
