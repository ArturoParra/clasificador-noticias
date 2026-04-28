const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'servicio_social', 'news-classifier', 'src', 'data', 'mockNews.ts');
const content = fs.readFileSync(filePath, 'utf8');

const startMarker = 'export const mockNewsData: NewsArticle[] = [';
const endMarker = 'export const mockNewsData2: NewsArticle[] = [';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find markers');
    process.exit(1);
}

const prefix = content.substring(0, startIdx + startMarker.length);
// Find the end of the array before mockNewsData2
// We need to find the last `]` before endIdx
const middle = content.substring(startIdx + startMarker.length, endIdx);
const lastBracketIdx = middle.lastIndexOf(']');

if (lastBracketIdx === -1) {
    console.error('Could not find closing bracket');
    process.exit(1);
}

const dataContent = middle.substring(0, lastBracketIdx + 1); // includes [ ... ]? No, startMarker includes [.
// Wait, startMarker includes `[`. So dataContent should be just `... ]`? No.
// startMarker ends with `[`. So middle starts AFTER `[`.
// So middle contains `\n  {\n    "id": ... \n  }\n]\n\n`
// So lastBracketIdx is index of `]`.

const arrayBody = middle.substring(0, lastBracketIdx); // content inside [ ... ]
const suffix = content.substring(endIdx);

// We need to parse arrayBody. It is a list of objects separated by commas.
// It might have trailing comma before `]`.
// Let's wrap it in `[` and `]` and try to parse with `eval` (DANGEROUS but this is local script on user machine).
// Or better: `new Function('return [' + arrayBody + ']')();`

let items;
try {
    // We need to handle `type` import or other things if they appear in object? No.
    // But duplicate keys? Standard JS handles it.
    // We might have `video: null`.
    // We might have `authors: [...]`.
    items = new Function('return [' + arrayBody + ']')();
} catch (e) {
    console.error('Error parsing data:', e);
    // If eval fails, maybe we can try to fix it?
    // Maybe some content has unescaped chars?
    process.exit(1);
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        // Format: "12 Ene, 2026"
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    } catch (e) {
        return dateStr;
    }
}

const newItems = items.map(item => {
    return {
        id: String(item.id),
        title: item.title,
        content: `generateMockContent('${item.title.replace(/'/g, "\\'")}')`, // Placeholder for function call
        description: item.summary || (item.text ? item.text.substring(0, 150) + '...' : ''),
        imageUrl: item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
        source: item.author || (item.source_country === 'mx' ? 'Fuente Nacional' : 'Fuente Internacional'),
        date: formatDate(item.publish_date),
        category: item.category || 'politics',
        credibilityScore: Math.floor(Math.random() * (95 - 70 + 1)) + 70,
        analysis: [
            {
                factor: 'Verificación de Fuente',
                score: 90,
                status: 'positive',
                description: 'Fuente reconocida y establecida.'
            },
            {
                factor: 'Precisión Factual',
                score: 85,
                status: 'positive',
                description: 'Contenido alineado con reportes verificados.'
            },
            {
                factor: 'Análisis de Contexto',
                score: 88,
                status: 'positive',
                description: 'Provee contexto adecuado para la noticia.'
            },
             {
                factor: 'Transparencia',
                score: 92,
                status: 'positive',
                description: 'Autores y fuentes claramente identificados.'
            }
        ]
    };
});

// Stringify
let jsonStr = JSON.stringify(newItems, null, 2);

// Replace "content": "generateMockContent(...)" with content: generateMockContent(...)
// Be careful with escaping.
jsonStr = jsonStr.replace(/"content": "generateMockContent\((.*?)\)"/g, 'content: generateMockContent($1)');
// Also keys are quoted in JSON. TS prefers unquoted keys if valid identifiers? 
// mockNewsData2 has unquoted keys: id, title, content...
// Let's remove quotes from keys.
jsonStr = jsonStr.replace(/"(\w+)":/g, '$1:');
// Fix single quotes for strings if possible? JSON uses double quotes. mockNewsData2 uses single quotes.
// Replace " with ' for string values? 
// Be careful not to break content inside strings.
// It's safer to leave double quotes or use a proper formatter. VS Code will format it later.
// But to match exactly:
// We can use a regex to replace "value" with 'value', handling escaped quotes.
// But this is complex. Let's stick to valid JS/TS with double quotes, it's fine.
// The user asked for "same format", which might imply single quotes, but structurally it is what matters.
// However, I can try to replace double quotes with single quotes for simple values.

const finalParams = jsonStr.substring(1, jsonStr.length - 1); // Remove outer [ ]
// Add back the [ ] in the file content logic.

const newFileContent = prefix + '\n' + finalParams + '\n' + ']' + suffix; // Wait, suffix starts with export...
// We removed ] from middle. middle ended with `mockNewsData2...`.
// Wait: `middle` was content between `[` of mockNewsData and `export const mockNewsData2`.
// `lastBracketIdx` was the `]` of mockNewsData array.
// So `middle` contains `... ];\n\n` possibly.
// My logic for `lastBracketIdx` found `]`. 
// So `content` up to `startIdx + startMarker.length` + `generated content` + `content from endIdx (start of mockNewsData2)`.
// But I need to allow for closing `];` or `]\n` before `mockNewsData2`.
// `middle` contains the closing `]`.
// So I should discard `middle` essentially, and replace it with `newItems`.
// BUT I need to keep the space between `]` and `mockNewsData2`.

// Let's reconstruct precisely.
// prefix: `... export const mockNewsData: NewsArticle[] = [`
// replacement: `\n ... items ... \n`
// closing: `]`
// spacer: `\n\n` (or whatever was between `]` and `export const mockNewsData2`)
// suffix: `export const mockNewsData2 ...`

// We need to find what was between `]` and `match of mockNewsData2`.
// `middle` is the text. `lastBracketIdx` is position of `]`.
// content after `]` in `middle` is `middle.substring(lastBracketIdx + 1)`.

const spacer = middle.substring(lastBracketIdx + 1); 

const reconstructed = prefix + finalParams + ']' + spacer + suffix;

fs.writeFileSync(filePath, reconstructed, 'utf8');
console.log('Done');
