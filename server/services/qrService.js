import QRCode from 'qrcode';

export const generateQrCodeUri = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error('QR Code Generation Failure:', error.message);
    return null;
  }
};
