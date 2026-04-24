import Secret from "../models/secret.model.js";
import AppError from "../utils/appError.utils.js";
import catchAsync from "../utils/catchAsync.js";
import { generateToken, encryption, decryption } from "../utils/crypto.util.js";

export const createSecret = catchAsync(async (req, res, next) => {
  const { secret, expiresSecretTimes } = req.body;
  if (!secret || !expiresSecretTimes) {
    return next(
      new AppError("Please provide secret and expiresSecretTimes", 400),
    );
  }

const expirySeconds = parseInt(expiresSecretTimes, 10); 
if (isNaN(expirySeconds) || expirySeconds <= 0) {
  return next(new AppError("Invalid expiry time", 400));
}

  const token = generateToken();
  const encryptedData = encryption(secret);
  const expiresAt = new Date(Date.now() + expiresSecretTimes * 1000);

  const newSecret = await Secret.create({ token, encryptedData, expiresAt });

  if (!newSecret) return next(new AppError("Secret not found", 404));
  
  if (newSecret.expiresAt < new Date()) {
    await Secret.deleteOne({ token }); 
    return next(new AppError("Secret has expired", 404));
  }

  const url = `http://localhost:5173/view/${token}`;

  res.status(201).json({
    status: "success",
    message: "Secret created successfully",
    url,
  });
});

export const getSecret = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Token is required", 400));
  }
   
  const secretDoc = await Secret.findOneAndUpdate(
    { token, isBurned: false ,expiresAt:{$gt:new Date()}},
    { $set: { isBurned: true } },
    { returnDocument: 'after' },
  );

  if (!secretDoc) {
    return next(new AppError("Secret not found or already burned", 404));
  }

  let decryptedData;

  try {
    decryptedData = decryption(secretDoc.encryptedData);
  } catch (err) {
    return next(new AppError("Failed to decrypt secret", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      secret: decryptedData,
    },
  });
});
