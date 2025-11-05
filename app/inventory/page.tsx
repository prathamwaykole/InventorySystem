import Pagination from "@/components/pagination";
import Sidebar from "@/components/sidebar";
import { deleteProduct, updateProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { prisma} from "@/lib/prisma"

export default async function Inventorypage({searchParams,}:{searchParams: Promise<{q?: string; page?: string }>;
}){
    
const user = await getCurrentUser()
const userId = user.id;

const params = await searchParams;
const q =( params.q ?? "").trim();
 const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 12;
const where= {
    userId,
   ...(q?{ name :{contains:q, mode:"insensitive" as const }}:{}),
};
  const [totalCount, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

const totalProduct = await prisma.product.findMany({where,});
const totalPages = Math.max(1,Math.ceil(totalCount/pageSize));

return ( <div className="min-h-screen bg-gray-50">
    <Sidebar currentPath="/inventory"/>
    <main className="ml-64 p-8">
        <div className="mb-8">
        <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-500">
                Manage your products and track inventory levels.</p>
        </div>
            </div>
           </div>
   <div className="space-y-6">
      {/*SEARCH*/}
<div className="bg-white rounded-lg border border-gray-200 p-6">
            <form className="flex gap-2" action="/inventory" method="GET">
              <input
                name="q"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg focus:border-transparent"
              />
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Search
              </button>
            </form>
          </div>

 {/*PRODUCTS TABLE*/}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
        <thead className = "bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Update</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
         {items.map((product,key) =>(
            <tr key={key} className="hover:bg-gray-50">
                <td className=" px-6 py-4 text-sm text-gray-500">{product.name}
                </td>
                <td className=" px-6 py-4 text-sm text-gray-500">{product.sku || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{Number(product.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.quantity}
                </td>
                 <td className="px-6 py-4  text-sm text-gray-500">{product.lowStockAt || "-"}
                    </td>
                    
                <td className=" px-6 py-4 text-sm text-gray-500">
                    <form action={async (formData : FormData) =>{
                    "use server";
                    await deleteProduct(formData);
                    }}>
                        <input type= "hidden" name = "id" value={product.id}/>
                        <button className="text-red-600 hover:text-red-900">
                            Delete
                        </button>
                        </form>
                </td>

                <td className="px-6 py-4 text-sm text-center text-gray-500">
                  <form action={async (formData: FormData) => {
      "use server";
      await updateProduct(formData);
    }}>
    <input type="hidden" name="id" value={product.id} />
    <input
      type="text"
      name="name"
      defaultValue={product.name}
      className="border rounded p-1 mx-1 w-24"
    />

    <input
      type="number"
      name="price"
      defaultValue={Number(product.price)}
      step="0.01"
      className="border rounded p-1 mx-1 w-20"
    />

    <input
      type="number"
      name="quantity"
      defaultValue={product.quantity}
      className="border rounded p-1 mx-1 w-16"
    />
    <input
      type="number"
      name="lowStockAt"
      defaultValue={product.lowStockAt ?? ""}
      className="border rounded p-1 mx-1 w-16"
    />

    <button
      type="submit"
      className="text-blue-600 hover:text-blue-900 "
    >
      Update
    </button>
  </form>
</td>
            </tr>
         ))}
        </tbody>
        </table>
    </div>
     {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{
                  q,
                  pageSize: String(pageSize),
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}