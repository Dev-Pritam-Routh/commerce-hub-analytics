import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSellerOrders, updateOrderStatus } from '@/services/orderService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, Package, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons'

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const { data, isLoading, error } = useQuery({
    queryKey: ['sellerOrders', searchParams],
    queryFn: () => fetchSellerOrders(searchParams),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrders', searchParams] });
      toast.success('Order status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus(orderId, newStatus);
  };

  const updateStatus = (orderId: string, newStatus: string) => {
    statusMutation.mutate({ orderId, status: newStatus });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchParams(prev => {
      prev.set('search', e.target.value);
      prev.set('page', '1');
      return prev;
    })
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value);
    setSearchParams(prev => {
      prev.set('status', value);
      prev.set('page', '1');
      return prev;
    })
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setSearchParams(prev => {
      prev.set('limit', String(newLimit));
      prev.set('page', '1');
      return prev;
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load orders</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data?.orders || data?.orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-8 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't received any orders yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center mb-2 md:mb-0">
          <Input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={handleSearch}
            className="mr-2"
          />
          <Select value={status} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={String(limit)} onValueChange={(value) => handleLimitChange(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.orders && data?.orders.map((order) => (
                <TableRow key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <TableCell className="font-medium">{order._id?.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(order.createdAt || Date.now()), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge className={`mr-2 ${getStatusColor(order.status || 'pending')}`} variant="outline">
                        {order.status || 'pending'}
                      </Badge>
                      {statusMutation.isLoading && statusMutation.variables?.orderId === order._id && <LoadingSpinner size="sm" />}
                      {statusMutation.isSuccess && statusMutation.variables?.orderId === order._id && <CheckCircle className="text-green-500 h-4 w-4 ml-1" />}
                      {statusMutation.isError && statusMutation.variables?.orderId === order._id && <XCircle className="text-red-500 h-4 w-4 ml-1" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Link to={`/orders/${order._id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {data?.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${page - 1}`}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: data?.totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href={`?page=${pageNumber}`}
                  isCurrent={pageNumber === page}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`?page=${page + 1}`}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === data?.totalPages}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default OrdersPage;
