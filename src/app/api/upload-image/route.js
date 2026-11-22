
export async function POST(request) {
    try {
        const apiKey = process.env.IMGBB_API_KEY;

        if (!apiKey) {
            return Response.json(
                { success: false, message: "ImgBB API key is missing." },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image || typeof image === "string") {
            return Response.json(
                { success: false, message: "Please select an image." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return Response.json(
                { success: false, message: "Only image files are allowed." },
                { status: 400 }
            );
        }

        if (image.size > 5 * 1024 * 1024) {
            return Response.json(
                { success: false, message: "Image must be smaller than 5 MB." },
                { status: 400 }
            );
        }

        const uploadData = new FormData();
        uploadData.append("image", image);

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
                method: "POST",
                body: uploadData,
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error("ImgBB upload error:", result);

            return Response.json(
                {
                    success: false,
                    message: "Image upload failed. Please try again.",
                },
                { status: 500 }
            );
        }

        return Response.json({
            success: true,
            imageUrl: result.data.url,
            deleteUrl: result.data.delete_url,
        });

    } catch (error) {
        console.error("Image upload error:", error);

        return Response.json(
            {
                success: false,
                message: "Something went wrong while uploading the image.",
            },
            { status: 500 }
        );
    }
}
