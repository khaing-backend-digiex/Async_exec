import {
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
} from "./Demo.js";

async function main() {
    try {
        await getCategories();
        await getProductsByCategory("groceries");
        await getProductsByBrand("Apple");
        await getBrands();
        await getProductsByCategoryAndMaxPrice("laptops", 1000);
        await getTopRatedProducts(3);
        await extractToExcel();
        await getProductsTitleAndPriceFromCsv("groceries.csv");
        await extractToExcelbyCategory("groceries");
        await calculateProfitAllProducts("all_products.csv", 20);
        await updateAllProductsWithPromise();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();