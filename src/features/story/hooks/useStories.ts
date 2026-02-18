import { useEffect, useState } from "react";
import { StorySummaryResponse } from "../services/story.api";
import { getStories, AppLanguage } from "../services/story.api";

export const useStories = (language: AppLanguage) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stories, setStories] = useState<StorySummaryResponse[]>([]);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await getStories(language);
                setStories(data);

                console.log(data);
            } catch (err) {
                setError("Failed to load stories");
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [language]);

    return { stories, loading, error };
};
