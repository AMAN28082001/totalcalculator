'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { items, categories, Item } from '@/data/items';
import Navbar from '@/components/Navbar';

interface SelectedItem {
  item: Item;
  quantity: number;
}

export default function Calculator() {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();


  // Auto-open cart on mobile when items are added
  useEffect(() => {
    if (selectedItems.length > 0 && window.innerWidth <= 768) {
      setIsCartOpen(true);
    }
  }, [selectedItems.length]);

  const filteredItems = items.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuantityChange = (item: Item, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(si => si.item.id !== item.id));
      return;
    }

    setSelectedItems(prev => {
      const existing = prev.find(si => si.item.id === item.id);
      if (existing) {
        return prev.map(si =>
          si.item.id === item.id ? { ...si, quantity } : si
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const getQuantity = (itemId: string) => {
    const selected = selectedItems.find(si => si.item.id === itemId);
    return selected ? selected.quantity : 0;
  };

  const getGSTRate = (category: string): number => {
    // 5% GST for Solar Panels and Inverters
    if (category === 'Solar Panels' || category === 'Inverters') {
      return 5;
    }
    // 18% GST for all other items
    return 18;
  };

  const calculateItemTotal = (selectedItem: SelectedItem) => {
    return selectedItem.item.rate * selectedItem.quantity;
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, selectedItem) => {
      return total + calculateItemTotal(selectedItem);
    }, 0);
  };

  const calculateGSTBreakdown = () => {
    let subtotal5Percent = 0;
    let subtotal18Percent = 0;

    selectedItems.forEach(selectedItem => {
      const itemTotal = calculateItemTotal(selectedItem);
      const gstRate = getGSTRate(selectedItem.item.category);
      
      if (gstRate === 5) {
        subtotal5Percent += itemTotal;
      } else {
        subtotal18Percent += itemTotal;
      }
    });

    const gst5Percent = subtotal5Percent * 0.05;
    const gst18Percent = subtotal18Percent * 0.18;

    return {
      subtotal5Percent,
      subtotal18Percent,
      gst5Percent,
      gst18Percent,
      totalGST: gst5Percent + gst18Percent
    };
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const { totalGST } = calculateGSTBreakdown();
    return subtotal + totalGST;
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(si => si.item.id !== itemId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCurrencyForPDF = (amount: number) => {
    // Format as plain number with Indian number system (commas) without currency symbol
    // to avoid font rendering issues in PDF
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const generatePDF = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to generate PDF');
      return;
    }

    // Dynamic import for client-side only
    const { default: jsPDF } = await import('jspdf');
    // Import autoTable - it extends jsPDF automatically
    const autoTableModule = await import('jspdf-autotable');
    // Get autoTable function
    const autoTable = (autoTableModule as any).default || autoTableModule;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Company Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CHAIRBORD PRIVATE LIMITED', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PLOT NO-10, SHRI SHYAM VIHAR', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('KALWAR ROAD JAIPUR RAJASTHAN, 302012', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('Contact: +91-9251666646 | E-Mail: support@chairbord.com', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLAR SYSTEM QUOTATION', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Date
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${currentDate}`, margin, yPosition);
    yPosition += 10;

    // Items Table
    const tableData = selectedItems.map((selectedItem, index) => {
      const itemTotal = calculateItemTotal(selectedItem);
      const gstRate = getGSTRate(selectedItem.item.category);
      // Ensure all values are strings, especially Rate and Amount to match GST styling
      return [
        String(index + 1),
        String(selectedItem.item.name),
        String(selectedItem.quantity),
        String(selectedItem.item.unit),
        String(formatCurrencyForPDF(selectedItem.item.rate)), // Rate as string
        String(`${gstRate}%`), // GST as string
        String(formatCurrencyForPDF(itemTotal)) // Amount as string
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['S.No.', 'Item Description', 'Qty', 'Unit', 'Rate', 'GST %', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        font: 'helvetica'
      },
      bodyStyles: {
        fontSize: 9,
        font: 'helvetica',
        fontStyle: 'normal',
        textColor: [0, 0, 0]
      },
      columnStyles: {
        // S.No.
        0: { 
          cellWidth: 20, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9,
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // Item Description - same font as all other data columns
        1: { 
          cellWidth: 60, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9,
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // Qty
        2: { 
          cellWidth: 15, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9,
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // Unit
        3: { 
          cellWidth: 15, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9,
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // Rate - identical styling to all other columns
        4: { 
          cellWidth: 25, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9, 
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // GST % - identical styling to all other columns
        5: { 
          cellWidth: 20, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9, 
          textColor: [0, 0, 0],
          valign: 'middle'
        },
        // Amount - identical styling to all other columns
        6: { 
          cellWidth: 25, 
          halign: 'left', 
          font: 'helvetica', 
          fontStyle: 'normal', 
          fontSize: 9, 
          textColor: [0, 0, 0],
          valign: 'middle'
        }
      },
      styles: {
        font: 'helvetica',
        fontStyle: 'normal',
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      margin: { left: margin, right: margin }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Price Breakdown
    const subtotal = calculateSubtotal();
    const gstBreakdown = calculateGSTBreakdown();
    const grandTotal = calculateGrandTotal();

    // Breakdown Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRICE BREAKDOWN', margin, yPosition);
    yPosition += 8;

    // Use consistent font size and style for all breakdown items
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', pageWidth - margin - 60, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrencyForPDF(subtotal), pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;

    // GST 5%
    if (gstBreakdown.subtotal5Percent > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(5, 150, 105);
      doc.text('GST (5%):', pageWidth - margin - 60, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrencyForPDF(gstBreakdown.gst5Percent), pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;
      doc.setTextColor(0, 0, 0);
    }

    // GST 18%
    if (gstBreakdown.subtotal18Percent > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(5, 150, 105);
      doc.text('GST (18%):', pageWidth - margin - 60, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrencyForPDF(gstBreakdown.gst18Percent), pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;
      doc.setTextColor(0, 0, 0);
    }

    // Total GST
    if (gstBreakdown.totalGST > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Total GST:', pageWidth - margin - 60, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrencyForPDF(gstBreakdown.totalGST), pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 8;
    }

    // Grand Total - completely transparent (no box, no border)
    const boxY = yPosition;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text
    doc.text('Grand Total:', pageWidth - margin - 60, boxY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrencyForPDF(grandTotal), pageWidth - margin, boxY, { align: 'right' });

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated quotation.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generate filename
    const filename = `Solar_Quotation_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="calculator-wrapper">
      <Navbar 
        cartItemCount={selectedItems.length} 
        onCartClick={() => setIsCartOpen(!isCartOpen)}
      />
      
      <div className="calculator-container">
        <div className="page-header">
          <h2 className="page-title">Solar Calculator</h2>
          <div className="company-details">
            <p>PLOT NO-10, SHRI SHYAM VIHAR</p>
            <p>KALWAR ROAD JAIPUR RAJASTHAN, 302012</p>
            <p>Contact: +91-9251666646 | E-Mail: support@chairbord.com</p>
          </div>
        </div>

      <div className="main-content">
        <div className="selection-panel">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="items-list">
            {filteredItems.length === 0 ? (
              <div className="no-items">No items found in this category</div>
            ) : (
              filteredItems.map(item => {
                const quantity = getQuantity(item.id);
                return (
                  <div key={item.id} className="item-card">
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-details">
                        <span className="item-rate">Rate: {formatCurrency(item.rate)}</span>
                        <span className="item-unit">Unit: {item.unit}</span>
                      </div>
                    </div>
                    <div className="item-controls">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleQuantityChange(item, val);
                        }}
                        placeholder="Qty"
                        className="quantity-input"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`summary-panel ${isCartOpen ? 'cart-open' : ''}`}>
          <div className="summary-header">
            <div className="cart-header-title">
              <h2>🛒 Cart ({selectedItems.length})</h2>
              <button 
                className="close-cart-button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>
            {selectedItems.length > 0 && (
              <div className="header-buttons">
                <button
                  onClick={generatePDF}
                  className="download-button"
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="clear-button"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="selected-items-list">
            {selectedItems.length === 0 ? (
              <div className="empty-cart">No items selected</div>
            ) : (
              selectedItems.map(selectedItem => {
                const total = calculateItemTotal(selectedItem);
                return (
                  <div key={selectedItem.item.id} className="selected-item">
                    <div className="selected-item-info">
                      <h4 className="selected-item-name">{selectedItem.item.name}</h4>
                      <div className="selected-item-details">
                        <span>
                          {selectedItem.quantity} {selectedItem.item.unit} × {formatCurrency(selectedItem.item.rate)}
                        </span>
                      </div>
                    </div>
                    <div className="selected-item-total">
                      <span className="total-amount">{formatCurrency(total)}</span>
                      <button
                        onClick={() => removeItem(selectedItem.item.id)}
                        className="remove-button"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="total-breakdown">
              <div className="breakdown-row">
                <span className="breakdown-label">Subtotal:</span>
                <span className="breakdown-value">{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              {(() => {
                const gstBreakdown = calculateGSTBreakdown();
                return (
                  <>
                    {gstBreakdown.subtotal5Percent > 0 && (
                      <div className="breakdown-row gst-row">
                        <span className="breakdown-label">GST (5%):</span>
                        <span className="breakdown-value">{formatCurrency(gstBreakdown.gst5Percent)}</span>
                      </div>
                    )}
                    {gstBreakdown.subtotal18Percent > 0 && (
                      <div className="breakdown-row gst-row">
                        <span className="breakdown-label">GST (18%):</span>
                        <span className="breakdown-value">{formatCurrency(gstBreakdown.gst18Percent)}</span>
                      </div>
                    )}
                    {gstBreakdown.totalGST > 0 && (
                      <div className="breakdown-row total-gst-row">
                        <span className="breakdown-label">Total GST:</span>
                        <span className="breakdown-value">{formatCurrency(gstBreakdown.totalGST)}</span>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="grand-total">
                <div className="grand-total-label">Grand Total</div>
                <div className="grand-total-amount">
                  {formatCurrency(calculateGrandTotal())}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {selectedItems.length > 0 && !isCartOpen && (
        <button 
          className="floating-cart-button"
          onClick={() => setIsCartOpen(true)}
        >
          🛒
          <span className="floating-cart-badge">{selectedItems.length}</span>
          <span className="floating-cart-text">View Cart</span>
        </button>
      )}
      </div>
    </div>
  );
}

