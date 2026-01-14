
const API_BASE_URL = 'https://electoral-roll-tracker-1.onrender.com';

async function run() {
    try {
        console.log('Fetching uploads...');
        const uploadsRes = await fetch(`${API_BASE_URL}/api/uploads`);
        if (!uploadsRes.ok) throw new Error(`Uploads fetch failed: ${uploadsRes.status} ${uploadsRes.statusText}`);
        const uploads = await uploadsRes.json();
        console.log(`Found ${uploads.length} uploads.`);

        if (uploads.length < 2) {
            console.log('Not enough uploads to compare.');
            return;
        }

        // Sort by uploaded_at desc (newest first)
        const sorted = [...uploads].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        // We want to compare the two NEWEST uploads usually, but let's see which ones DiffViewer picks.
        // DiffViewer picks: slices(0, 2) from apiUploads. 
        // And then sorts them by uploaded_at ASCending to assign oldFile (earlier) and newFile (later).

        // Let's do the same.
        const top2 = sorted.slice(0, 2);
        const sortedForCompare = [...top2].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));

        const oldFile = sortedForCompare[0];
        const newFile = sortedForCompare[1];

        console.log(`Comparing Old: ${oldFile.filename} (${oldFile.upload_id}) vs New: ${newFile.filename} (${newFile.upload_id})`);

        const compareRes = await fetch(`${API_BASE_URL}/api/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                old_upload_id: oldFile.upload_id,
                new_upload_id: newFile.upload_id
            })
        });

        if (!compareRes.ok) throw new Error(`Compare fetch failed: ${compareRes.status} ${compareRes.statusText}`);
        const data = await compareRes.json();

        console.log('Comparison Stats:', data.stats);

        if (data.added && data.added.length > 0) {
            console.log('First added record:', JSON.stringify(data.added[0], null, 2));
        } else {
            console.log('No added records.');
        }

        if (data.deleted && data.deleted.length > 0) {
            console.log('First deleted record:', JSON.stringify(data.deleted[0], null, 2));
        } else {
            console.log('No deleted records.');
        }

        if (data.modified && data.modified.length > 0) {
            console.log('First modified record:', JSON.stringify(data.modified[0], null, 2));
        } else {
            console.log('No modified records.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

run();
