
export {
    getAllProducts,
    getCategories,
    getProductsByCategory,
    getProductsByBrand,
    getBrands,
    getProductsByCategoryAndMaxPrice,
    getTopRatedProducts,
    extractToExcelbyCategory,
    getProductsTitleAndPriceFromCsv,
    extractToExcel,
    calculateProfitAllProducts,
    updateAllProductsWithPromise
};
import fs from 'fs/promises';
const API_URL1 = "https://dummyjson.com/products";
const API_URL2 = "https://fakestoreapi.com/products";

const timeout = (ms) =>
    new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Timeout after ${ms / 1000}s`));
        }, ms);
    });

const fetchWithTimeout = async (url, apiName) => {
    const res = await Promise.race([
        fetch(url),
        timeout(2000)
    ]);

    if (!res.ok) {
        throw new Error(`${apiName} error: ${res.status} ${res.statusText}`);
    }

    return res.json();
};
async function getAllProducts() {
    try {
        const res = await Promise.any([
            fetchWithTimeout(API_URL1, "API 1"),
            fetchWithTimeout(API_URL2, "API 2")
        ]);

        console.log(res);
        return res.products || res;
    } catch (error) {
        console.log("All APIs failed:", error);
        throw new Error("Failed to fetch products from all APIs");
    }
}



async function getCategories() {
    try {
        const products = await getAllProducts();
        const categories = [...new Set(products.map(p => p.category))];
        console.log("Categories:", categories);
        return categories;
    } catch (error) {
        console.log("Error fetching products:", error);
        throw error;
    }
}


async function getProductsByCategory(category) {
    try {
        const products = await getAllProducts().catch(error => {
            console.log("Error fetching products:", error);
            throw error;
        });
        const filtered = products.filter(p => p.category === category);
        console.log(`Products in "${category}":`, filtered);
        return filtered;

    }
    catch (error) {
        throw error;
    }
}

async function getProductsByBrand(brand) {
    try {
        const products = await getAllProducts();
        const filtered = products.filter(
            p => p.brand && p.brand.toLowerCase() === brand.toLowerCase()
        );
        console.log(`Products from brand "${brand}":`, filtered);
        return filtered;
    } catch (error) {
        console.log("Error fetching products:", error);
        throw error;
    }
}


async function getBrands() {
    try {
        const products = await getAllProducts().catch(error => {
            console.log("Error fetching products:", error);
            return [];
        });
        const brands = [...new Set(products.filter(p => p.brand).map(p => p.brand))];
        console.log("Brands:", brands);
        return brands;
    } catch (error) {
        console.log("Error fetching products:", error);
        throw error;
    }
}

async function getProductsByCategoryAndMaxPrice(category, maxPrice) {
    try {
        const products = await getAllProducts().catch(error => {
            console.log("Error fetching products:", error);
            return [];
        });
        const filtered = products.filter(
            p => p.category === category && p.price <= maxPrice
        );
        console.log(`Products in "${category}" under ${maxPrice}:`, filtered);
        return filtered;
    }
    catch (error) {
        console.log("Error fetching products:", error);
        throw error;
    }
}

async function getTopRatedProducts(limit = 5) {
    try {
        const products = await getAllProducts();
        const sorted = [...products].sort((a, b) => b.rating - a.rating);
        const top = sorted.slice(0, limit);
        console.log("Top rated:", top);
        return top;
    } catch (error) {
        console.log("Error fetching products:", error);
        throw error;
    }
}


function escapeCSV(value) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object") {
        value = JSON.stringify(value);
    }

    return `"${String(value).replaceAll('"', '""')}"`;
}

async function extractToExcelbyCategory(category) {
    try {
        const products = await getProductsByCategory(category);

        if (products.length === 0) {
            console.log(`No products found for category "${category}"`);
            return;
        }

        const headers = Object.keys(products[0]);
        const header = headers.join(",");

        const rows = products.map((product) => {
            return headers.map((header) => {
                const value = product[header];
                return escapeCSV(value);
            }).join(",");
        });

        const csvContent = [
            header,
            ...rows
        ].join("\n");

        await fs.writeFile(`${category}.csv`, "\uFEFF" + csvContent, "utf8");

        console.log(`Data for category "${category}" has been extracted to ${category}.csv`);
    } catch (error) {
        console.log("Error extracting to Excel:", error);
        throw error;
    }
}
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}
async function getProductsTitleAndPriceFromCsv(csvFile) {
    try {
        const data = await fs.readFile(csvFile, "utf8");
        const lines = data.split("\n").filter(line => line.trim() !== "");
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const titleIndex = headers.indexOf("title");
        const priceIndex = headers.indexOf("price");

        const products = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            return {
                title: values[titleIndex],
                price: values[priceIndex]
            };
        });

        products.forEach(product => {
            console.log("Title:", product.title, "Price:", product.price);
        });

        return products;
    } catch (error) {
        console.log("Error reading CSV file:", error);
        throw error;
    }
}
async function extractToExcel() {
    try {
        const products = await getAllProducts();

        if (products.length === 0) {
            console.log(`No products found`);
            return;
        }
        const headers = Object.keys(products[0]);
        const header = headers.join(",");
        const rows = products.map((product) => {
            return headers.map((header) => {
                const value = product[header];
                return escapeCSV(value);
            }).join(",");
        });
        const csvContent = [
            header,
            ...rows
        ].join("\n");
        await fs.writeFile("all_products.csv", "\uFEFF" + csvContent, "utf8");
        console.log(`Data for all products has been extracted to all_products.csv`);
    } catch (error) {
        console.log("Error extracting to Excel:", error);
        throw error;
    }
}
async function calculateProfitAllProducts(CSVFile) {
    try {
        const PROFIT_PERCENT = 20; // mặc định lợi nhuận 20%

        const data = await fs.readFile(CSVFile, "utf8");

        const lines = data
            .split(/\r?\n/)
            .filter(line => line.trim() !== "");

        const headers = parseCSVLine(lines[0]).map(h =>
            h.trim().replace(/^\uFEFF/, "")
        );

        const priceIndex = headers.indexOf("price");
        const stockIndex = headers.indexOf("stock");

        if (priceIndex === -1 || stockIndex === -1) {
            throw new Error("File must contain price and stock columns");
        }

        let profitIndex = headers.indexOf("profit");

        if (profitIndex === -1) {
            headers.push("profit");
            profitIndex = headers.length - 1;
        }

        let totalProfit = 0;

        const newRows = lines.slice(1).map(line => {
            const values = parseCSVLine(line);

            const price = Number(values[priceIndex]);
            const stock = Number(values[stockIndex]);

            let profit = 0;

            if (!isNaN(price) && !isNaN(stock)) {
                profit = price * stock * PROFIT_PERCENT / 100;
                totalProfit += profit;
            }

            while (values.length < headers.length) {
                values.push("");
            }

            values[profitIndex] = profit.toFixed(2);

            return values.map(value => escapeCSV(value)).join(",");
        });

        const newContent = [
            headers.map(header => escapeCSV(header)).join(","),
            ...newRows
        ].join("\n");

        await fs.writeFile(CSVFile, "\uFEFF" + newContent, "utf8");

        console.log(`Total profit with ${PROFIT_PERCENT}%:`, totalProfit.toFixed(2));
        console.log(`Column profit has been added to ${CSVFile}`);

        return totalProfit;
    } catch (error) {
        console.log("Error calculating profit:", error);
        throw error;
    }
}
