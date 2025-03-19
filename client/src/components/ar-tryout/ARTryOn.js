import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import {
  Box,
  Button,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

// Import the export/import utility functions
import { exportFitAdjustmentsToFile, importFitAdjustmentsFromFile } from './fit-export-utility';

const ARTryOn = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const fileInputRef = useRef(null);
  const [model, setModel] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [segmentation, setSegmentation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const imageCache = useRef(new Map());
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12; // Adjust as needed

  // Default fit adjustment values
  const defaultFitAdjustments = {
    scale: 1.0,          // Overall scale multiplier
    width: 1.0,          // Width adjustment multiplier
    height: 1.0,         // Height adjustment multiplier
    xOffset: 0,          // Horizontal position adjustment (-20 to 20)
    yOffset: 0,          // Vertical position adjustment (-20 to 20)
    rotation: 0,         // Rotation adjustment in degrees (-20 to 20 degrees)
    necklineOffset: 0,   // Neckline adjustment for tops (-10 to 10)
    lengthOffset: 0,     // Length adjustment for bottoms (-10 to 10)
    showControls: false  // Whether to show adjustment controls
  };

  // Advanced fit adjustment options
  const [fitAdjustments, setFitAdjustments] = useState(defaultFitAdjustments);

  // Store item-specific saved adjustments
  const [savedAdjustments, setSavedAdjustments] = useState({});

  // State to track if current adjustments are unsaved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved adjustments from localStorage on initial load
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('clothingFitAdjustments');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSavedAdjustments(parsedData);
        console.log("Loaded saved adjustments:", parsedData);
      }
    } catch (error) {
      console.error("Error loading saved adjustments:", error);
    }
  }, []);

  // Load TensorFlow.js and BodyPix model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);

        // Ensure TensorFlow.js is initialized
        await tf.ready();
        console.log("TensorFlow.js initialized successfully");

        // Load BodyPix model
        const net = await bodyPix.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2
        });

        setModel(net);
        console.log("BodyPix model loaded successfully");

        setLoading(false);

        setSnackbar({
          open: true,
          message: 'Body tracking ready! Select an item to try on.',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error loading TensorFlow/BodyPix:', error);
        setLoading(false);
        setError("Failed to load body tracking. Please make sure you have a stable internet connection.");

        setSnackbar({
          open: true,
          message: 'Error loading body tracking system. Please refresh the page.',
          severity: 'error'
        });
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Ensure the canvas is correctly sized
  useEffect(() => {
    if (cameraEnabled && webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const setupCanvas = () => {
        const video = webcamRef.current.video;
        if (!video) return;

        const canvas = canvasRef.current;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Ensure canvas has alpha channel
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };

      // Setup once video is ready
      const checkVideoReady = setInterval(() => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
          clearInterval(checkVideoReady);
          setupCanvas();
        }
      }, 100);

      return () => {
        clearInterval(checkVideoReady);
      };
    }
  }, [cameraEnabled]);

  // Set up segmentation loop when camera and model are ready
  useEffect(() => {
    // Don't start if camera is disabled or model isn't loaded
    if (!cameraEnabled || !model || !webcamRef.current) return;

    let isActive = true;

    const segmentBody = async () => {
      // Check if component is still mounted and camera is enabled
      if (!isActive || !cameraEnabled || !model || !webcamRef.current) return;

      const video = webcamRef.current.video;

      // Check if video is ready
      if (video && video.readyState === 4) {
        try {
          // Run segmentation with higher confidence threshold for better edge detection
          const segmentation = await model.segmentPersonParts(video, {
            flipHorizontal: false, // Don't flip in segmentation, we'll handle mirroring in drawing
            internalResolution: 'medium', // Can try 'high' for better quality but slower
            segmentationThreshold: 0.7,
            maxDetections: 1,
            scoreThreshold: 0.2,
            nmsRadius: 20
          });

          setSegmentation(segmentation);

          // Draw the results
          if (canvasRef.current) {
            drawResults(segmentation);
          }
        } catch (error) {
          console.error("Error during segmentation:", error);
        }
      }

      // Continue the segmentation loop
      requestRef.current = requestAnimationFrame(segmentBody);
    };

    // Start the segmentation loop
    segmentBody();

    // Cleanup function
    return () => {
      isActive = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [cameraEnabled, model, selectedItem, fitAdjustments]);

  // Preload images when products change
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(product => {
        if (product.images && product.images.length > 0) {
          product.images.forEach(image => {
            if (image.url && !imageCache.current.has(image.url)) {
              const img = new Image();

              // Setup image for proper transparency
              img.crossOrigin = "Anonymous";

              img.onload = () => {
                // Process image to ensure transparency
                const processedImg = processImageForTransparency(img);
                imageCache.current.set(image.url, processedImg);
                console.log("Image loaded with transparency:", image.url);
              };

              img.onerror = (err) => {
                console.error("Error loading image:", err);
              };

              img.src = image.url;
            }
          });
        }
      });
    }
  }, [products]);

  // Process image to ensure transparency by removing background
  const processImageForTransparency = (img) => {
    // Create a canvas to process the image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Clear canvas to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Get image data to manipulate pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Loop through each pixel and make black/dark/background pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Enhanced background detection - looks for likely background colors
      // Detects dark backgrounds
      if (r < 40 && g < 40 && b < 40) {
        data[i + 3] = 0; // Set alpha to transparent
      }

      // Detects white/light gray backgrounds
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }

      // Detects common background green (if using green screen techniques)
      if (r < 100 && g > 180 && b < 100) {
        data[i + 3] = 0;
      }
    }

    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  };

  // Draw segmentation results on canvas
  const drawResults = (segmentation) => {
    if (!canvasRef.current || !segmentation) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Clear the canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (segmentation.allPoses && segmentation.allPoses.length > 0) {
      // Mirror the canvas to match mirrored webcam
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // Make sure we're using source-over to preserve transparency
      ctx.globalCompositeOperation = 'source-over';

      // Draw the selected clothing item if available
      if (selectedItem) {
        // Use segmentation mask for better fitting
        drawClothingWithMask(ctx, segmentation, selectedItem);
      }

      // Restore canvas context
      ctx.restore();
    } else {
      // No body detected - show guidance
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText('No body detected - please stand back', canvas.width / 2, canvas.height / 4);
    }
  };

  // Draw clothing with mask for better body fitting
  const drawClothingWithMask = (ctx, segmentation, selectedItem) => {
    if (!segmentation.allPoses || segmentation.allPoses.length === 0 || !selectedItem) return;

    const category = selectedItem.category;
    const pose = segmentation.allPoses[0];

    // Find the main image for the selected item
    if (!selectedItem.images || selectedItem.images.length === 0) return;

    const imageData = selectedItem.images.find(img => img.isMain) || selectedItem.images[0];
    if (!imageData.url) return;

    // Use cached image if available
    if (imageCache.current.has(imageData.url)) {
      const clothingImg = imageCache.current.get(imageData.url);

      // Draw based on category
      switch (category) {
        case 'Shirts':
        case 'Sweaters':
        case 'Jackets':
        case 'Coats':
          drawTorsoItem(ctx, pose.keypoints, segmentation, clothingImg);
          break;
        case 'Pants':
          drawLowerBodyItem(ctx, pose.keypoints, segmentation, clothingImg);
          break;
        case 'Dresses':
          drawFullBodyItem(ctx, pose.keypoints, segmentation, clothingImg);
          break;
        case 'Accessories':
          drawAccessoryItem(ctx, pose.keypoints, clothingImg);
          break;
        default:
          drawTorsoItem(ctx, pose.keypoints, segmentation, clothingImg);
      }
    } else {
      console.log("Image not yet loaded:", imageData.url);
    }
  };

  // Helper to get body part mask for better fitting
  const getBodyPartMask = (segmentation, partIds) => {
    if (!segmentation || !segmentation.data) return null;

    const { width, height } = segmentation;
    const mask = new Uint8ClampedArray(width * height);

    for (let i = 0; i < segmentation.data.length; i++) {
      const partId = segmentation.data[i];
      if (partIds.includes(partId)) {
        mask[i] = 255; // Set to white (visible)
      }
    }

    return { data: mask, width, height };
  };

  // Draw a torso item (shirt, jacket, etc.) with improved fitting
  const drawTorsoItem = (ctx, keypoints, segmentation, clothingCanvas) => {
    // Find relevant keypoints
    const leftShoulder = keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const leftHip = keypoints.find(kp => kp.part === 'leftHip');
    const rightHip = keypoints.find(kp => kp.part === 'rightHip');
    const leftElbow = keypoints.find(kp => kp.part === 'leftElbow');
    const rightElbow = keypoints.find(kp => kp.part === 'rightElbow');

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      console.log("Missing required keypoints for torso item");
      return;
    }

    // Calculate dimensions based on body proportions with improved accuracy
    const shoulderWidth = Math.abs(rightShoulder.position.x - leftShoulder.position.x);
    const shoulderY = Math.min(leftShoulder.position.y, rightShoulder.position.y);
    const hipY = Math.max(leftHip.position.y, rightHip.position.y);
    const torsoHeight = hipY - shoulderY;

    // For more precise shoulder width, include arm positions if available
    let enhancedShoulderWidth = shoulderWidth;
    if (leftElbow && rightElbow) {
      const armSpan = Math.abs(rightElbow.position.x - leftElbow.position.x);
      // Use the larger of shoulder width or a fraction of arm span
      enhancedShoulderWidth = Math.max(shoulderWidth, armSpan * 0.8);
    }

    // Calculate center position
    const centerX = (leftShoulder.position.x + rightShoulder.position.x) / 2;
    const centerY = shoulderY + (torsoHeight / 4); // Position slightly below shoulders

    // Apply user fit adjustments - now with separate width and height adjustments
    const widthMultiplier = 2.0 * fitAdjustments.width * fitAdjustments.scale;
    const heightMultiplier = 1.4 * fitAdjustments.height * fitAdjustments.scale;

    const itemWidth = enhancedShoulderWidth * widthMultiplier;
    const itemHeight = torsoHeight * heightMultiplier;

    // Apply position offset adjustments with expanded range
    const xOffset = (fitAdjustments.xOffset / 100) * ctx.canvas.width;
    const yOffset = (fitAdjustments.yOffset / 100) * ctx.canvas.height;

    // Apply neckline offset - adjust how high the top of the garment sits
    const necklineOffset = (fitAdjustments.necklineOffset / 10) * torsoHeight;

    // Rotation in radians
    const rotation = (fitAdjustments.rotation * Math.PI) / 180;

    // Save the context state
    ctx.save();

    // Apply translation to position the item
    ctx.translate(
      centerX - (itemWidth / 2) + xOffset,
      centerY - (itemHeight * 0.25) + yOffset + necklineOffset
    );

    // Apply rotation if needed
    if (rotation !== 0) {
      // Rotate around the center of the item
      ctx.translate(itemWidth / 2, itemHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-itemWidth / 2, -itemHeight / 2);
    }

    // Ensure we're using source-over for proper transparency
    ctx.globalCompositeOperation = 'source-over';

    // Draw the item
    ctx.drawImage(
      clothingCanvas,
      0, 0,
      itemWidth, itemHeight
    );

    // Restore context
    ctx.restore();
  };

  // Draw a lower body item (pants, skirts) with improved fitting
  const drawLowerBodyItem = (ctx, keypoints, segmentation, clothingCanvas) => {
    // Find relevant keypoints
    const leftHip = keypoints.find(kp => kp.part === 'leftHip');
    const rightHip = keypoints.find(kp => kp.part === 'rightHip');
    const leftKnee = keypoints.find(kp => kp.part === 'leftKnee');
    const rightKnee = keypoints.find(kp => kp.part === 'rightKnee');
    const leftAnkle = keypoints.find(kp => kp.part === 'leftAnkle');
    const rightAnkle = keypoints.find(kp => kp.part === 'rightAnkle');

    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) {
      console.log("Missing required keypoints for lower body item");
      return;
    }

    // Calculate dimensions with improved accuracy
    const hipWidth = Math.abs(rightHip.position.x - leftHip.position.x);
    const hipY = Math.min(leftHip.position.y, rightHip.position.y); // Use the higher hip point
    const ankleY = Math.max(leftAnkle.position.y, rightAnkle.position.y); // Use the lower ankle point
    const legLength = ankleY - hipY;

    // Use knees to determine leg shape if available
    let kneeWidth = hipWidth;
    if (leftKnee && rightKnee) {
      kneeWidth = Math.abs(rightKnee.position.x - leftKnee.position.x);
    }

    // Calculate center position
    const centerX = (leftHip.position.x + rightHip.position.x) / 2;

    // Apply user fit adjustments - now with separate width and height controls
    const widthMultiplier = 1.5 * fitAdjustments.width * fitAdjustments.scale;
    const heightMultiplier = 1.05 * fitAdjustments.height * fitAdjustments.scale;

    // Size adjustment for pants - make hip area wider than knee area for natural shape
    const itemWidth = hipWidth * widthMultiplier;
    const itemHeight = legLength * heightMultiplier;

    // Apply position offset adjustments with expanded range
    const xOffset = (fitAdjustments.xOffset / 100) * ctx.canvas.width;
    const yOffset = (fitAdjustments.yOffset / 100) * ctx.canvas.height;

    // Length adjustment for pants/skirts (how much they extend down)
    const lengthOffset = (fitAdjustments.lengthOffset / 10) * legLength;

    // Rotation in radians
    const rotation = (fitAdjustments.rotation * Math.PI) / 180;

    // Save context state
    ctx.save();

    // Apply translation to position the item
    ctx.translate(
      centerX - (itemWidth / 2) + xOffset,
      hipY - (itemHeight * 0.05) + yOffset
    );

    // Apply rotation if needed
    if (rotation !== 0) {
      // Rotate around the center of the item
      ctx.translate(itemWidth / 2, itemHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-itemWidth / 2, -itemHeight / 2);
    }

    // Use source-over to preserve transparency
    ctx.globalCompositeOperation = 'source-over';

    // Draw the item with length adjustment
    ctx.drawImage(
      clothingCanvas,
      0, 0,
      itemWidth,
      itemHeight + lengthOffset
    );

    // Reset context state
    ctx.restore();
  };

  // Draw a full body item (dresses) with improved fitting
  const drawFullBodyItem = (ctx, keypoints, segmentation, clothingCanvas) => {
    // Find relevant keypoints
    const leftShoulder = keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const leftHip = keypoints.find(kp => kp.part === 'leftHip');
    const rightHip = keypoints.find(kp => kp.part === 'rightHip');
    const leftAnkle = keypoints.find(kp => kp.part === 'leftAnkle');
    const rightAnkle = keypoints.find(kp => kp.part === 'rightAnkle');

    if (!leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) {
      console.log("Missing required keypoints for full body item");
      return;
    }

    // Calculate dimensions with better proportions
    const shoulderWidth = Math.abs(rightShoulder.position.x - leftShoulder.position.x);
    const shoulderY = Math.min(leftShoulder.position.y, rightShoulder.position.y);
    const hipWidth = leftHip && rightHip ? Math.abs(rightHip.position.x - leftHip.position.x) : shoulderWidth * 1.1;
    const ankleY = Math.max(leftAnkle.position.y, rightAnkle.position.y);
    const bodyHeight = ankleY - shoulderY;

    // Calculate center position
    const centerX = (leftShoulder.position.x + rightShoulder.position.x) / 2;

    // Apply user fit adjustments with separate width and height controls
    const widthMultiplier = 2.2 * fitAdjustments.width * fitAdjustments.scale;
    const heightMultiplier = 1.02 * fitAdjustments.height * fitAdjustments.scale;

    // Adjust width based on wider of shoulder or hip (accounting for feminine silhouette)
    const maxWidth = Math.max(shoulderWidth, hipWidth);
    const itemWidth = maxWidth * widthMultiplier;
    const itemHeight = bodyHeight * heightMultiplier;

    // Apply position offset adjustments with expanded range
    const xOffset = (fitAdjustments.xOffset / 100) * ctx.canvas.width;
    const yOffset = (fitAdjustments.yOffset / 100) * ctx.canvas.height;

    // Neckline adjustment (for dress tops)
    const necklineOffset = (fitAdjustments.necklineOffset / 10) * bodyHeight * 0.05;

    // Length adjustment for dresses
    const lengthOffset = (fitAdjustments.lengthOffset / 10) * bodyHeight * 0.1;

    // Rotation in radians
    const rotation = (fitAdjustments.rotation * Math.PI) / 180;

    // Save context state
    ctx.save();

    // Apply translation to position the item
    ctx.translate(
      centerX - (itemWidth / 2) + xOffset,
      shoulderY - (itemHeight * 0.02) + yOffset + necklineOffset
    );

    // Apply rotation if needed
    if (rotation !== 0) {
      // Rotate around the center of the item
      ctx.translate(itemWidth / 2, itemHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-itemWidth / 2, -itemHeight / 2);
    }

    // Use source-over to preserve transparency
    ctx.globalCompositeOperation = 'source-over';

    // Position the item
    ctx.drawImage(
      clothingCanvas,
      0, 0,
      itemWidth,
      itemHeight + lengthOffset
    );

    // Reset context state
    ctx.restore();
  };

  // Draw accessories (hats, glasses, etc.)
  const drawAccessoryItem = (ctx, keypoints, clothingCanvas) => {
    // Find relevant face keypoints
    const nose = keypoints.find(kp => kp.part === 'nose');
    const leftEye = keypoints.find(kp => kp.part === 'leftEye');
    const rightEye = keypoints.find(kp => kp.part === 'rightEye');

    if (!nose || !leftEye || !rightEye) {
      console.log("Missing required keypoints for accessory item");
      return;
    }

    // Calculate dimensions
    const faceWidth = Math.abs(rightEye.position.x - leftEye.position.x) * 5; // Approximate face width

    // Calculate center position
    const centerX = nose.position.x;
    const centerY = nose.position.y;

    // Apply user fit adjustments with separate width and height controls
    const widthMultiplier = fitAdjustments.width * fitAdjustments.scale;
    const heightMultiplier = fitAdjustments.height * fitAdjustments.scale;

    // Size adjustment for accessory
    const itemWidth = faceWidth * widthMultiplier;
    const aspectRatio = clothingCanvas.height / clothingCanvas.width;
    const itemHeight = itemWidth * aspectRatio * heightMultiplier; // Adjust height independently

    // Apply position offset adjustments with expanded range
    const xOffset = (fitAdjustments.xOffset / 100) * ctx.canvas.width;
    const yOffset = (fitAdjustments.yOffset / 100) * ctx.canvas.height;

    // Rotation in radians
    const rotation = (fitAdjustments.rotation * Math.PI) / 180;

    // Save context state
    ctx.save();

    // Apply translation to position the item
    ctx.translate(
      centerX - (itemWidth / 2) + xOffset,
      centerY - (itemHeight / 2) + yOffset
    );

    // Apply rotation if needed
    if (rotation !== 0) {
      // Rotate around the center of the item
      ctx.translate(itemWidth / 2, itemHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-itemWidth / 2, -itemHeight / 2);
    }

    // Use source-over to preserve transparency
    ctx.globalCompositeOperation = 'source-over';

    // Position the item
    ctx.drawImage(
      clothingCanvas,
      0, 0,
      itemWidth,
      itemHeight
    );

    // Reset context state
    ctx.restore();
  };

  // ======= PERMANENT STORAGE FUNCTIONS =======

  // Save current adjustments for the selected item
  const saveCurrentAdjustments = () => {
    if (!selectedItem) return;

    // Create a copy without the showControls property
    const adjustmentsToSave = {
      scale: fitAdjustments.scale,
      width: fitAdjustments.width,
      height: fitAdjustments.height,
      xOffset: fitAdjustments.xOffset,
      yOffset: fitAdjustments.yOffset,
      rotation: fitAdjustments.rotation,
      necklineOffset: fitAdjustments.necklineOffset,
      lengthOffset: fitAdjustments.lengthOffset
    };

    // Update saved adjustments state
    const newSavedAdjustments = {
      ...savedAdjustments,
      [selectedItem._id]: adjustmentsToSave
    };

    setSavedAdjustments(newSavedAdjustments);
    setHasUnsavedChanges(false);

    // Save to localStorage for persistence
    try {
      localStorage.setItem('clothingFitAdjustments', JSON.stringify(newSavedAdjustments));

      setSnackbar({
        open: true,
        message: 'Fit adjustments saved! These settings will be applied whenever you select this item.',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error saving adjustments to localStorage:", error);

      setSnackbar({
        open: true,
        message: 'Error saving fit adjustments to browser storage. Try exporting to file instead.',
        severity: 'error'
      });
    }
  };

  // Delete saved adjustments for the current item
  const deleteSavedAdjustments = () => {
    if (!selectedItem || !savedAdjustments[selectedItem._id]) return;

    // Create new object without the current item
    const { [selectedItem._id]: _, ...remainingAdjustments } = savedAdjustments;

    // Update state
    setSavedAdjustments(remainingAdjustments);

    // Reset to defaults
    setFitAdjustments({
      ...defaultFitAdjustments,
      showControls: true // Keep controls open
    });

    setHasUnsavedChanges(false);

    // Update localStorage
    try {
      localStorage.setItem('clothingFitAdjustments', JSON.stringify(remainingAdjustments));

      setSnackbar({
        open: true,
        message: 'Custom fit adjustments removed. Using default settings.',
        severity: 'info'
      });
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  // Export all saved adjustments to a file
  const handleExportAdjustments = () => {
    if (Object.keys(savedAdjustments).length === 0) {
      setSnackbar({
        open: true,
        message: 'No saved adjustments to export. Save some items first!',
        severity: 'warning'
      });
      return;
    }

    const result = exportFitAdjustmentsToFile(savedAdjustments);

    setSnackbar({
      open: true,
      message: result.message,
      severity: result.success ? 'success' : 'error'
    });
  };

  // Import adjustments from a file
  const handleImportAdjustments = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    importFitAdjustmentsFromFile(file)
      .then(result => {
        // Update saved adjustments with imported data
        setSavedAdjustments(result.data);

        // Save to localStorage
        localStorage.setItem('clothingFitAdjustments', JSON.stringify(result.data));

        // If the current item has saved adjustments in the imported data, apply them
        if (selectedItem && result.data[selectedItem._id]) {
          setFitAdjustments({
            ...result.data[selectedItem._id],
            showControls: fitAdjustments.showControls
          });
          setHasUnsavedChanges(false);
        }

        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });

        // Close settings dialog if open
        if (showSettingsDialog) {
          setShowSettingsDialog(false);
        }
      })
      .catch(error => {
        console.error('Error importing file:', error);
        setSnackbar({
          open: true,
          message: 'Error importing file: ' + error.message,
          severity: 'error'
        });
      });

    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Reset fit adjustments to defaults
  const resetFitAdjustments = () => {
    setFitAdjustments({
      ...defaultFitAdjustments,
      showControls: fitAdjustments.showControls
    });

    // Mark as having unsaved changes if we had saved adjustments
    if (selectedItem && savedAdjustments[selectedItem._id]) {
      setHasUnsavedChanges(true);
    }
  };

  // Handle slider changes for fit adjustments
  const handleFitAdjustmentChange = (property, value) => {
    setFitAdjustments({
      ...fitAdjustments,
      [property]: value
    });

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);
  };

  // Clear all saved adjustments
  const handleClearAllAdjustments = () => {
    if (window.confirm("Are you sure you want to clear all saved fit adjustments? This cannot be undone.")) {
      // Clear state and localStorage
      setSavedAdjustments({});
      localStorage.removeItem('clothingFitAdjustments');

      // Reset current adjustments
      setFitAdjustments({
        ...defaultFitAdjustments,
        showControls: fitAdjustments.showControls
      });

      setHasUnsavedChanges(false);

      setSnackbar({
        open: true,
        message: 'All saved fit adjustments have been cleared.',
        severity: 'info'
      });

      // Close settings dialog
      setShowSettingsDialog(false);
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Add pagination parameters to the request
        const response = await fetch(`http://localhost:5001/api/products?page=${currentPage}&limit=${productsPerPage}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Handle both array and object with products property
        const productList = Array.isArray(data) ? data : (data.products || []);

        // Get total pages from response if available, or estimate based on product count
        setTotalPages(data.totalPages || Math.ceil(productList.length / productsPerPage) || 1);

        setProducts(productList);

        // If no products, set some fallback data
        if (productList.length === 0) {
          setProducts([
            {
              _id: '1',
              name: 'Blue T-Shirt (Fallback)',
              description: 'A comfortable cotton t-shirt',
              price: 29.99,
              category: 'Shirts',
              images: [{ url: '/api/placeholder/400/500', isMain: true }]
            },
            {
              _id: '2',
              name: 'Black Jeans (Fallback)',
              description: 'Classic black jeans',
              price: 49.99,
              category: 'Pants',
              images: [{ url: '/api/placeholder/400/500', isMain: true }]
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);

        // Set fallback products if fetch fails
        setProducts([
          {
            _id: '1',
            name: 'Blue T-Shirt (Fallback)',
            description: 'A comfortable cotton t-shirt',
            price: 29.99,
            category: 'Shirts',
            images: [{ url: '/api/placeholder/400/500', isMain: true }]
          },
          {
            _id: '2',
            name: 'Black Jeans (Fallback)',
            description: 'Classic black jeans',
            price: 49.99,
            category: 'Pants',
            images: [{ url: '/api/placeholder/400/500', isMain: true }]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, productsPerPage]); // Add currentPage as dependency to refresh when page changes

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Sort products so that those with images appear first
  const sortedProducts = filteredProducts.sort((a, b) => {
    const aHasImages = a.images && a.images.length > 0;
    const bHasImages = b.images && b.images.length > 0;
    return bHasImages - aHasImages;
  });

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  const handleSelectItem = (item) => {
    console.log("Selected item:", item);
    setSelectedItem(item);

    // Check if we have saved adjustments for this item
    if (savedAdjustments[item._id]) {
      // Load the saved adjustments
      setFitAdjustments({
        ...savedAdjustments[item._id],
        showControls: false // Keep controls closed initially
      });
      setHasUnsavedChanges(false);

      setSnackbar({
        open: true,
        message: 'Loaded your saved fit adjustments for this item',
        severity: 'info'
      });
    } else {
      // Reset to default adjustments
      setFitAdjustments({
        ...defaultFitAdjustments,
        showControls: false
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const toggleFitControls = () => {
    setFitAdjustments({
      ...fitAdjustments,
      showControls: !fitAdjustments.showControls
    });
  };

  const addToSubscription = () => {
    if (!selectedItem) return;

    setSnackbar({
      open: true,
      message: `Added ${selectedItem.name} to your next subscription box!`,
      severity: 'success'
    });
  };

  const buyNow = () => {
    if (!selectedItem) return;

    setSnackbar({
      open: true,
      message: `Purchased ${selectedItem.name} for ${selectedItem.price.toFixed(2)}!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Settings Dialog
  const renderSettingsDialog = () => {
    return (
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Fit Adjustment Settings
          <IconButton
            aria-label="close"
            onClick={() => setShowSettingsDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Permanent Storage Options
          </Typography>
          <Typography variant="body2" paragraph>
            Your fit adjustments are saved to your browser's local storage, which persists between sessions.
            For more permanent storage or to transfer settings between devices, use the export/import functions.
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CloudDownloadIcon />}
              onClick={handleExportAdjustments}
              disabled={Object.keys(savedAdjustments).length === 0}
            >
              Export Adjustments to File
            </Button>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              component="label"
            >
              Import Adjustments from File
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportAdjustments}
                ref={fileInputRef}
              />
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Saved Adjustments Summary
          </Typography>

          {Object.keys(savedAdjustments).length > 0 ? (
            <>
              <Typography variant="body2" paragraph>
                You have saved fit adjustments for {Object.keys(savedAdjustments).length} items.
              </Typography>

              <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                {Object.entries(savedAdjustments).map(([itemId, adjustments]) => {
                  // Find the product name if available
                  const product = products.find(p => p._id === itemId);
                  const productName = product ? product.name : `Item ${itemId.slice(-6)}`;

                  return (
                    <Box key={itemId} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                        {productName}
                      </Typography>
                      <Chip
                        label="Custom Fit"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  );
                })}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" paragraph>
              You don't have any saved fit adjustments yet.
              Select a product, customize the fit, and save it to create permanent adjustments.
            </Typography>
          )}

          <Box sx={{ mt: 3, borderTop: '1px solid #eee', pt: 2 }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Danger Zone
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearAllAdjustments}
              disabled={Object.keys(savedAdjustments).length === 0}
            >
              Clear All Saved Adjustments
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading AR Try-On System...
        </Typography>
      </Box>
    );
  }

  if (error && products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading AR Try-On
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '90vh', p: 2 }}>
      {/* Left side - AR View */}
      <Box sx={{ flex: 2, position: 'relative', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden' }}>
        {/* Camera view */}
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Webcam
            ref={webcamRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              visibility: cameraEnabled ? 'visible' : 'hidden',
              transform: 'scaleX(-1)' // Mirror the webcam
            }}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />

          {/* Canvas overlay for drawings */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraEnabled ? 'block' : 'none'
            }}
          />

          {/* Display when camera is disabled */}
          {!cameraEnabled && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor: '#f5f5f5'
            }}>
              <Typography variant="h5" gutterBottom>
                Camera is disabled
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Enable camera to try on clothes
              </Typography>
              <Button variant="contained" onClick={toggleCamera}>
                Enable Camera
              </Button>
            </Box>
          )}
        </Box>

        {/* Camera toggle and fit controls */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={toggleCamera}
          >
            {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
          </Button>

          {cameraEnabled && selectedItem && (
            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={toggleFitControls}
              color="primary"
            >
              Adjust Fit
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => setShowSettingsDialog(true)}
            title="Manage saved fit settings"
          >
            Settings
          </Button>
        </Box>

        {/* Fit adjustment controls - shown when enabled */}
        {cameraEnabled && selectedItem && fitAdjustments.showControls && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 70,
              left: 10,
              width: { xs: '90%', sm: 400 },
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
              p: 2,
              pb: 3,
              zIndex: 10,
              boxShadow: 3,
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Advanced Fit Adjustments
                {savedAdjustments[selectedItem._id] && !hasUnsavedChanges && (
                  <Chip
                    label="Saved"
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
                {hasUnsavedChanges && (
                  <Chip
                    label="Unsaved"
                    size="small"
                    color="warning"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Typography>
              <IconButton size="small" onClick={resetFitAdjustments} title="Reset to defaults">
                <RestartAltIcon />
              </IconButton>
            </Box>

            <Accordion defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Size Adjustments</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Overall Scale</Typography>
                  <Slider
                    value={fitAdjustments.scale}
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    onChange={(e, value) => handleFitAdjustmentChange('scale', value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Width</Typography>
                  <Slider
                    value={fitAdjustments.width}
                    min={0.6}
                    max={1.4}
                    step={0.05}
                    onChange={(e, value) => handleFitAdjustmentChange('width', value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Height</Typography>
                  <Slider
                    value={fitAdjustments.height}
                    min={0.6}
                    max={1.4}
                    step={0.05}
                    onChange={(e, value) => handleFitAdjustmentChange('height', value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Position & Rotation</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Horizontal Position</Typography>
                  <Slider
                    value={fitAdjustments.xOffset}
                    min={-20}
                    max={20}
                    step={1}
                    onChange={(e, value) => handleFitAdjustmentChange('xOffset', value)}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Vertical Position</Typography>
                  <Slider
                    value={fitAdjustments.yOffset}
                    min={-20}
                    max={20}
                    step={1}
                    onChange={(e, value) => handleFitAdjustmentChange('yOffset', value)}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Rotation (degrees)</Typography>
                  <Slider
                    value={fitAdjustments.rotation}
                    min={-20}
                    max={20}
                    step={1}
                    onChange={(e, value) => handleFitAdjustmentChange('rotation', value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => `${value}°`}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Garment-Specific Adjustments</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {(selectedItem?.category === 'Shirts' || selectedItem?.category === 'Sweaters' ||
                  selectedItem?.category === 'Jackets' || selectedItem?.category === 'Coats') && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>Neckline Adjustment</Typography>
                      <Slider
                        value={fitAdjustments.necklineOffset}
                        min={-10}
                        max={10}
                        step={1}
                        onChange={(e, value) => handleFitAdjustmentChange('necklineOffset', value)}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}

                {(selectedItem?.category === 'Pants' || selectedItem?.category === 'Dresses') && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Length Adjustment</Typography>
                    <Slider
                      value={fitAdjustments.lengthOffset}
                      min={-10}
                      max={10}
                      step={1}
                      onChange={(e, value) => handleFitAdjustmentChange('lengthOffset', value)}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Action buttons for saving/deleting adjustments */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {/* Main save button */}
              <Button
                variant="contained"
                fullWidth
                disabled={!hasUnsavedChanges}
                onClick={saveCurrentAdjustments}
                startIcon={<SaveIcon />}
                sx={{ textTransform: 'none' }}
              >
                Save Adjustments for this Item
              </Button>

              {/* Export/Import row */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Export to file button */}
                <Button
                  variant="outlined"
                  onClick={handleExportAdjustments}
                  title="Export all saved adjustments to a file"
                  startIcon={<FileDownloadIcon />}
                  sx={{ flex: 1 }}
                >
                  Export
                </Button>

                {/* Import from file button */}
                <Button
                  variant="outlined"
                  component="label"
                  title="Import adjustments from a file"
                  startIcon={<FileUploadIcon />}
                  sx={{ flex: 1 }}
                >
                  Import
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportAdjustments}
                  />
                </Button>

                {/* Delete saved adjustments button */}
                {savedAdjustments[selectedItem?._id] && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={deleteSavedAdjustments}
                    title="Delete saved adjustments for current item"
                    sx={{ minWidth: 'unset' }}
                  >
                    <DeleteIcon />
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Right side - Controls & Items */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <Typography variant="h5">Virtual Try-On</Typography>

        {/* Item Selection */}
        <Box>
          <Typography variant="h6">Select Item</Typography>

          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            {sortedProducts.map((item) => (
              <Grid item xs={12} sm={6} key={item._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedItem?._id === item._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    },
                    position: 'relative'
                  }}
                  onClick={() => handleSelectItem(item)}
                >
                  {/* Badge for items with saved adjustments */}
                  {savedAdjustments[item._id] && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        zIndex: 1,
                        boxShadow: 1
                      }}
                      title="Has saved fit adjustments"
                    >
                      <TuneIcon sx={{ fontSize: 14 }} />
                    </Box>
                  )}

                  <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                    {item.images && item.images.length > 0 ? (
                      <Box
                        component="img"
                        src={item.images.find(img => img.isMain)?.url || item.images[0].url}
                        alt={item.name}
                        sx={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src="/api/placeholder/100/100"
                        alt={item.name}
                        sx={{ height: 80, width: 80, objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Chip size="small" label={item.category || 'Other'} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(null, currentPage - 1)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Previous
              </Button>
              <Typography variant="body1" sx={{ alignSelf: 'center', mx: 2 }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(null, currentPage + 1)}
                variant="outlined"
                sx={{ ml: 1 }}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>

        {selectedItem && (
          <>
            {/* Product Info */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{selectedItem.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  {selectedItem.description}
                </Typography>

                {selectedItem.colors && selectedItem.colors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="medium">Available Colors:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedItem.colors.map(color => (
                        <Chip key={color} label={color} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedItem.sizes && selectedItem.sizes.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="medium">Available Sizes:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedItem.sizes.map(size => (
                        <Chip
                          key={typeof size === 'object' ? size.size : size}
                          label={typeof size === 'object' ? size.size : size}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={addToSubscription} fullWidth>
                Add to Subscription Box
              </Button>
              <Button variant="outlined" onClick={buyNow} fullWidth>
                Buy Now (${selectedItem.price.toFixed(2)})
              </Button>
            </Box>
          </>
        )}

        {/* Help & Instructions */}
        <Accordion sx={{ mt: 'auto' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How to Use</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Enable your camera using the button in the bottom left
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Stand back so your full body is visible in the frame
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Select clothing items from the right panel
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Click "Adjust Fit" to fine-tune the size and position
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Add items to your subscription box or purchase directly
                </Typography>
              </li>
            </ol>

            {cameraEnabled && (
              <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                Tip: Stand in good lighting with your full body visible for best results
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Settings Dialog */}
      {renderSettingsDialog()}

      {/* Hidden input for file import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImportAdjustments}
      />
    </Box>
  );
};

export default ARTryOn;