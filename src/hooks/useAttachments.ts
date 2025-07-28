import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetCustomerAttachments,
  actUploadCustomerAttachment,
  actDeleteCustomerAttachment,
  actGetVendorAttachments,
  actUploadVendorAttachment,
  actDeleteVendorAttachment,
  actGetOrderAttachments,
  actUploadOrderAttachment,
  actDeleteOrderAttachment,
} from "@/store/attachments/act";

export const useAttachments = () => {
  const dispatch = useAppDispatch();
  const attachments = useAppSelector((state) => state.attachments);

  // Customer attachments
  const getCustomerAttachments = async (custAccount: string) => {
    try {
      return await dispatch(actGetCustomerAttachments(custAccount)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const uploadCustomerAttachment = async (custAccount: string, file: File) => {
    try {
      return await dispatch(
        actUploadCustomerAttachment({ custAccount, file })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const deleteCustomerAttachment = async (
    custAccount: string,
    fileName: string
  ) => {
    try {
      return await dispatch(
        actDeleteCustomerAttachment({ custAccount, fileName })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  // Vendor attachments
  const getVendorAttachments = async (vendAccount: string) => {
    try {
      return await dispatch(actGetVendorAttachments(vendAccount)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const uploadVendorAttachment = async (vendAccount: string, file: File) => {
    try {
      return await dispatch(
        actUploadVendorAttachment({ vendAccount, file })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const deleteVendorAttachment = async (
    vendAccount: string,
    fileName: string
  ) => {
    try {
      return await dispatch(
        actDeleteVendorAttachment({ vendAccount, fileName })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  // Order attachments
  const getOrderAttachments = async (orderId: string) => {
    try {
      return await dispatch(actGetOrderAttachments(orderId)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const uploadOrderAttachment = async (orderId: string, file: File) => {
    try {
      return await dispatch(
        actUploadOrderAttachment({ orderId, file })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const deleteOrderAttachment = async (orderId: string, fileName: string) => {
    try {
      return await dispatch(
        actDeleteOrderAttachment({ orderId, fileName })
      ).unwrap();
    } catch (error) {
      throw error;
    }
  };

  return {
    // State
    customerFiles: attachments.customerFiles,
    vendorFiles: attachments.vendorFiles,
    orderFiles: attachments.orderFiles,
    loading: attachments.loading,
    error: attachments.error,
    uploadLoading: attachments.uploadLoading,
    uploadError: attachments.uploadError,
    uploadSuccess: attachments.uploadSuccess,
    deleteLoading: attachments.deleteLoading,
    deleteError: attachments.deleteError,
    deleteSuccess: attachments.deleteSuccess,

    // Customer actions
    getCustomerAttachments,
    uploadCustomerAttachment,
    deleteCustomerAttachment,

    // Vendor actions
    getVendorAttachments,
    uploadVendorAttachment,
    deleteVendorAttachment,

    // Order actions
    getOrderAttachments,
    uploadOrderAttachment,
    deleteOrderAttachment,
  };
};
