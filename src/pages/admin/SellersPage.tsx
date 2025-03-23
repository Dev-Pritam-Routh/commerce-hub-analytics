import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSellers, updateSellerStatus, deleteSeller } from '@/services/adminService';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SellerStatus = ({ status }: { status: 'active' | 'inactive' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)} variant="outline">
      {status}
    </Badge>
  );
};

const SellersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: sellers, isLoading, isError } = useQuery({
    queryKey: ['admin-sellers', { search: searchQuery, status, page: currentPage, limit: pageSize }],
    queryFn: () => fetchSellers({ search: searchQuery, status, page: currentPage, limit: pageSize }),
  });

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ sellerId, status }: { sellerId: string; status: 'active' | 'inactive' }) => 
      updateSellerStatus(sellerId, status),
    onSuccess: () => {
      toast.success('Seller status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update seller status');
    },
  });

  const deleteSellerMutation = useMutation({
    mutationFn: (sellerId: string) => deleteSeller(sellerId),
    onSuccess: () => {
      toast.success('Seller deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete seller');
    },
  });

  const handleStatusUpdate = (sellerId: string, newStatus: 'active' | 'inactive') => {
    updateStatusMutation.mutate({ sellerId, status: newStatus });
  };

  const handleDeleteSeller = (sellerId: string) => {
    deleteSellerMutation.mutate(sellerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error fetching sellers</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Sellers Management</CardTitle>
          <CardDescription>View and manage sellers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search sellers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers?.sellers.map((seller) => (
                <TableRow key={seller._id}>
                  <TableCell>{seller.name}</TableCell>
                  <TableCell>{seller.email}</TableCell>
                  <TableCell>{format(new Date(seller.createdAt), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>
                    <SellerStatus status={seller.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/sellers/${seller._id}`} className="hover:underline">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Select onValueChange={(value) => handleStatusUpdate(seller._id, value as 'active' | 'inactive')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the seller from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSeller(seller._id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {sellers && 
              <div className="flex items-center gap-1">
                {[...Array(sellers.totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            }
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={sellers ? currentPage >= sellers.totalPages : true}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellersPage;
