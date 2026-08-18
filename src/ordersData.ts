import {
  Order,
  OrderStatus,
  OrderPriority,
  CustomerType,
  ShippingType,
  CopilotRecommendation,
  OrderCategory,
  B2BShipment
} from './types';

export const ORDER_PIPELINE_STAGES: OrderStatus[] = [
  'New',
  'Priority Assigned',
  'Inventory Checked',
  'Stock Allocated',
  'Picking',
  'Packing',
  'Quality Check',
  'Ready for Dispatch',
  'Dispatched',
  'Delivered'
];

/**
 * Explainable Order Priority Calculation Engine
 * 
 * Rules:
 * - CRITICAL: VIP customer + SLA < 60 minutes, OR SLA < 30 minutes
 * - URGENT: Express order + SLA < 2 hours (120 mins)
 * - HIGH: VIP order with healthy SLA, OR Business contract order approaching deadline (< 4 hours)
 * - NORMAL: Standard order with healthy SLA (> 2 hours)
 * - LOW: Economy order with large remaining SLA window (> 4 hours)
 */
export function computeOrderPriority(
  customerType: CustomerType,
  shippingType: ShippingType,
  slaRemainingMinutes: number,
  orderCategory: OrderCategory = 'business'
): OrderPriority {
  if (slaRemainingMinutes <= 30 || (customerType === 'VIP' && slaRemainingMinutes <= 60)) {
    return 'Critical';
  }
  if (shippingType === 'Express' && slaRemainingMinutes <= 120) {
    return 'Urgent' as OrderPriority;
  }
  if (customerType === 'VIP' || (orderCategory === 'business' && slaRemainingMinutes <= 240)) {
    return 'High';
  }
  if (shippingType === 'Economy' && slaRemainingMinutes > 240) {
    return 'Low';
  }
  return 'Normal';
}

export function computeSlaRiskLevel(slaRemainingMinutes: number): 'Safe' | 'Watch' | 'At Risk' | 'Critical' {
  if (slaRemainingMinutes <= 30) return 'Critical';
  if (slaRemainingMinutes <= 120) return 'At Risk';
  if (slaRemainingMinutes <= 240) return 'Watch';
  return 'Safe';
}

export function getNextOrderStatus(current: OrderStatus): OrderStatus {
  const currentIndex = ORDER_PIPELINE_STAGES.indexOf(current);
  if (currentIndex === -1 || currentIndex >= ORDER_PIPELINE_STAGES.length - 1) {
    return current;
  }
  return ORDER_PIPELINE_STAGES[currentIndex + 1];
}

export const initialCopilotRecommendations: CopilotRecommendation[] = [
  {
    id: 'rec-104',
    title: 'B2B: Prioritize Apollo Care Critical Medical Cartons (#MTH-1042)',
    targetOrderId: 'ORD-MTH-1042',
    targetOrderNumber: '#MTH-1042',
    problem: '8 orders are at risk of missing their SLA. Order #MTH-1042 has 24 minutes remaining.',
    reason: 'Packing Station 2 is operating at 132% capacity with two priority hospital orders waiting.',
    businessImpact: 'Potential 21-minute dispatch delay on hospital emergency ICU supply contract.',
    confidence: 96,
    recommendedAction: 'Move 2 available packers from Zone B to Packing Station 2.',
    expectedResult: 'Reduce SLA risk from 8 orders to 2 and recover 21 minutes in packing queue.',
    actionType: 'prioritize',
    badgeText: 'Muthu Recommends • B2B SLA'
  },
  {
    id: 'rec-112',
    title: 'B2B: Dispatch Wholesale Truck AP 05 XX 1234 (Sri Lakshmi Distributors)',
    targetOrderId: 'ORD-89112',
    targetOrderNumber: '#112',
    problem: 'Truck AP 05 XX 1234 is 88% loaded and ready at Bay-04.',
    reason: 'Order #112 has passed Quality Check and is palletized. Loading now ensures on-time arrival before toll rush.',
    businessImpact: 'Guarantees Vijayawada wholesale distribution delivery SLA.',
    confidence: 99,
    recommendedAction: 'Authorize immediate gate clearance pass and dispatch Truck AP 05 XX 1234.',
    expectedResult: 'Prevent 45-minute toll checkpoint delay and secure 100% on-time dispatch SLA.',
    actionType: 'dispatch_first',
    badgeText: 'Muthu Decides • Logistics'
  },
  {
    id: 'rec-125',
    title: 'B2B: Split Pallet Consignment for Coastal MedTech (#125)',
    targetOrderId: 'ORD-89125',
    targetOrderNumber: '#125',
    problem: '6 main medical monitor pallets ready at dock, but 2 accessory cartons in Mezzanine Level 2 delayed.',
    reason: 'Enterprise contract permits partial shipment. 75% of consignment (₹3,40,000) can dispatch on 11:45 AM freight.',
    businessImpact: 'Satisfies hospital emergency ward installation deadline.',
    confidence: 94,
    recommendedAction: 'Split into Consignment #125-A (Dispatch Now) and #125-B (Afternoon Run).',
    expectedResult: 'Deliver 75% order value (₹3.4L) on schedule while clearing staging bay.',
    actionType: 'split_shipment',
    badgeText: 'Muthu Recommends • Multi-Shipment'
  },
  {
    id: 'rec-b2c-ananya',
    title: 'B2C: Expedite Consumer Express #122 (Ananya Reddy)',
    targetOrderId: 'ORD-89122',
    targetOrderNumber: '#122',
    problem: 'Customer selected 2-hour Same-Day delivery with 18 minutes remaining.',
    reason: 'Courier pickup van (TS 09 XX 1199) is idling at Bay 1 for urban residential route.',
    businessImpact: 'Maintains 100% On-Time Consumer SLA and 5-star customer rating.',
    confidence: 96,
    recommendedAction: 'Route to Express Packing Station 1 and hand over to BlueDart Courier.',
    expectedResult: 'Deliver within 18 minutes to preserve 100% On-Time Consumer SLA.',
    actionType: 'prioritize',
    badgeText: 'Muthu Observes • Consumer Express'
  }
];

export const initialOrders: Order[] = [
  // THE 8 CRITICAL/AT-RISK SLA ORDERS (Requirement 11 & 12)
  {
    id: 'ORD-MTH-1042',
    orderNumber: '#MTH-1042',
    orderCategory: 'business',
    customerName: 'Apollo Care Hospital Supplies',
    companyName: 'Apollo Care Hospital Group',
    customerType: 'VIP',
    orderValue: 142000,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 10:15 AM',
    expectedDispatchTime: 'Today 11:30 AM',
    slaDeadline: '11:45 AM (24 mins left)',
    slaRemainingMinutes: 24,
    currentStatus: 'Packing',
    assignedPicker: 'Ravi Kumar',
    assignedPacker: 'Elena Rostova',
    warehouseZone: 'Zone B & Packing Bay 2',
    itemCount: 18,
    isNearSlaRisk: true,
    isP1: true,
    slaRiskLevel: 'Critical',
    slaRiskReason: 'Packing Station 2 is operating at 132% capacity with queue backlog.',
    assignedTruckId: 'TRK-HYD-01',
    assignedTruckNumber: 'AP 05 XX 1234',
    muthuRecommendationText: 'Move 2 available packers from Zone B to Packing Station 2.',
    muthuConfidence: 97,
    contractType: 'Enterprise Tier-1 Emergency Healthcare SLA',
    deliveryWindow: 'Today 01:00 PM - 02:00 PM',
    accountManager: 'Vikram Joshi (Senior Enterprise Lead)',
    shippingAddress: 'Apollo Health City, Jubilee Hills, Hyderabad, Telangana 500033',
    items: [
      { id: 'itm-1', name: 'Digital Infrared Medical Thermometers', sku: 'SKU-EQP-1066', quantity: 8, unitPrice: 4200, binLocation: 'B-03-02-A' },
      { id: 'itm-2', name: 'Sterile Surgical Glove Boxes (50ct)', sku: 'SKU-PKG-1042', quantity: 10, unitPrice: 10840, binLocation: 'C-04-04-B' }
    ],
    estimatedCompletionTime: '11:28 AM'
  },
  {
    id: 'ORD-89104',
    orderNumber: '#104',
    orderCategory: 'business',
    customerName: 'Sri Lakshmi Distributors',
    companyName: 'Sri Lakshmi Wholesale FMCG Ltd',
    customerType: 'VIP',
    orderValue: 86500,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 09:45 AM',
    expectedDispatchTime: 'Today 11:40 AM',
    slaDeadline: '11:55 AM (28 mins left)',
    slaRemainingMinutes: 28,
    currentStatus: 'Picking',
    assignedPicker: 'Marcus Vance',
    assignedPacker: 'David Kim',
    warehouseZone: 'Zone B Aisle 04',
    itemCount: 14,
    isNearSlaRisk: true,
    isP1: true,
    slaRiskLevel: 'Critical',
    slaRiskReason: 'Zone B picker congested behind 12 standard batch totes.',
    assignedTruckId: 'TRK-HYD-01',
    assignedTruckNumber: 'AP 05 XX 1234',
    muthuRecommendationText: 'Assign dedicated fast-track runner to bypass standard conveyor aisle.',
    muthuConfidence: 96,
    contractType: 'Priority Commercial Restock Agreement',
    deliveryWindow: 'Today 03:00 PM',
    accountManager: 'Kiran Rao',
    shippingAddress: 'Sri Lakshmi Wholesale Mart, Benz Circle, Vijayawada, AP 520010',
    items: [
      { id: 'itm-3', name: 'Heavy Duty Packaging Tape (36 Rolls)', sku: 'SKU-PKG-1037', quantity: 8, unitPrice: 3200, binLocation: 'B-02-01-C' },
      { id: 'itm-4', name: 'Barcode Scanners 2D Bluetooth', sku: 'SKU-EQP-1065', quantity: 6, unitPrice: 10150, binLocation: 'B-04-01-A' }
    ],
    estimatedCompletionTime: '11:35 AM'
  },
  {
    id: 'ORD-89108',
    orderNumber: '#108',
    orderCategory: 'business',
    customerName: 'Bharat Office Systems',
    companyName: 'Bharat Enterprise Infrastructure',
    customerType: 'Business',
    orderValue: 64200,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 09:30 AM',
    expectedDispatchTime: 'Today 12:00 PM',
    slaDeadline: '12:15 PM (38 mins left)',
    slaRemainingMinutes: 38,
    currentStatus: 'Stock Allocated',
    assignedPicker: 'Suresh Naidu',
    assignedPacker: 'Priya Sharma',
    warehouseZone: 'Zone C Mezzanine',
    itemCount: 12,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'Mezzanine lift maintenance held up heavy steel monitor arm replenishment.',
    assignedTruckId: 'TRK-HYD-01',
    assignedTruckNumber: 'AP 05 XX 1234',
    muthuRecommendationText: 'Auto-route pick from Ground Overflow Bin C-01-02.',
    muthuConfidence: 94,
    contractType: 'Scheduled IT Infrastructure Contract',
    deliveryWindow: 'Today 04:30 PM',
    accountManager: 'Anil Reddy',
    shippingAddress: 'Cyber Gateway Block A, HITEC City, Hyderabad, Telangana 500081',
    items: [
      { id: 'itm-5', name: 'Dual Monitor Mount Arms', sku: 'SKU-FUR-1015', quantity: 12, unitPrice: 5350, binLocation: 'C-01-02-A' }
    ],
    estimatedCompletionTime: '11:50 AM'
  },
  {
    id: 'ORD-89115',
    orderNumber: '#115',
    orderCategory: 'individual',
    customerName: 'Rahul Sharma',
    customerType: 'VIP',
    orderValue: 24500,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 10:30 AM',
    expectedDispatchTime: 'Today 12:10 PM',
    slaDeadline: '12:20 PM (45 mins left)',
    slaRemainingMinutes: 45,
    currentStatus: 'Picking',
    assignedPicker: 'Karthik Rao',
    assignedPacker: 'Sunita Nair',
    warehouseZone: 'Zone A Aisle 02',
    itemCount: 3,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'Single item pick list stalled in batch queue.',
    assignedTruckId: 'TRK-HYD-02',
    assignedTruckNumber: 'TS 09 XX 5678',
    muthuRecommendationText: 'Split into single-item express tote to finish picking in 4 minutes.',
    muthuConfidence: 95,
    deliveryMethod: 'Same-Day BlueDart Courier',
    paymentStatus: 'Prepaid Verified',
    shippingAddress: 'Flat 402, Aditya Empress Towers, Tolichowki, Hyderabad 500008',
    items: [
      { id: 'itm-6', name: 'ProBook 15" Workstation Laptop', sku: 'SKU-ELC-1002', quantity: 1, unitPrice: 24500, binLocation: 'A-01-03-B' }
    ],
    estimatedCompletionTime: '11:58 AM'
  },
  {
    id: 'ORD-89117',
    orderNumber: '#117',
    orderCategory: 'business',
    customerName: 'Coastal MedTech Diagnostics',
    companyName: 'Coastal Health Laboratories',
    customerType: 'VIP',
    orderValue: 98000,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 09:15 AM',
    expectedDispatchTime: 'Today 12:30 PM',
    slaDeadline: '12:45 PM (52 mins left)',
    slaRemainingMinutes: 52,
    currentStatus: 'Quality Check',
    assignedPicker: 'Vikram Joshi',
    assignedPacker: 'Elena Rostova',
    warehouseZone: 'QC Station 1',
    itemCount: 8,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'QC Station 1 has 14 high-precision diagnostic kits queued.',
    assignedTruckId: 'TRK-HYD-03',
    assignedTruckNumber: 'KA 01 XX 4321',
    muthuRecommendationText: 'Open Auxiliary QC Bench 2 to clear diagnostic verification backlog.',
    muthuConfidence: 98,
    contractType: 'Clinical Diagnostic SLA',
    deliveryWindow: 'Today 05:00 PM',
    accountManager: 'Pradeep Swamy',
    shippingAddress: 'Coastal Diagnostic Tower, Waltair Uplands, Visakhapatnam, AP 530003',
    items: [
      { id: 'itm-7', name: 'Biochem Centrifuge Tubes Case', sku: 'SKU-PKG-1040', quantity: 8, unitPrice: 12250, binLocation: 'C-04-04-A' }
    ],
    estimatedCompletionTime: '12:12 PM'
  },
  {
    id: 'ORD-89122',
    orderNumber: '#122',
    orderCategory: 'individual',
    customerName: 'Ananya Reddy',
    customerType: 'VIP',
    orderValue: 18900,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 10:45 AM',
    expectedDispatchTime: 'Today 12:40 PM',
    slaDeadline: '01:00 PM (68 mins left)',
    slaRemainingMinutes: 68,
    currentStatus: 'Ready for Dispatch',
    assignedPicker: 'Ravi Kumar',
    assignedPacker: 'David Kim',
    warehouseZone: 'Express Pack Staging',
    itemCount: 2,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'BlueDart Courier van departure window closing in 20 minutes.',
    assignedTruckId: 'TRK-HYD-06',
    assignedTruckNumber: 'AP 16 XX 3456',
    muthuRecommendationText: 'Directly hand over package to BlueDart Door 2 courier.',
    muthuConfidence: 97,
    deliveryMethod: 'BlueDart Air Same-Day',
    paymentStatus: 'Prepaid Verified',
    shippingAddress: 'Villa 18, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066',
    items: [
      { id: 'itm-8', name: 'Ergonomic Mechanical Keyboard', sku: 'SKU-ACC-1025', quantity: 2, unitPrice: 9450, binLocation: 'A-02-04-A' }
    ],
    estimatedCompletionTime: '12:35 PM'
  },
  {
    id: 'ORD-89128',
    orderNumber: '#128',
    orderCategory: 'business',
    customerName: 'Krishna Retail Network',
    companyName: 'Krishna Superstores Group',
    customerType: 'Business',
    orderValue: 112000,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 09:00 AM',
    expectedDispatchTime: 'Today 01:15 PM',
    slaDeadline: '01:30 PM (85 mins left)',
    slaRemainingMinutes: 85,
    currentStatus: 'Packing',
    assignedPicker: 'Manoj Pillai',
    assignedPacker: 'Elena Rostova',
    warehouseZone: 'Zone B Packing',
    itemCount: 22,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'Heavy volume 22-carton pallet requiring shrink wrap machine.',
    assignedTruckId: 'TRK-HYD-04',
    assignedTruckNumber: 'TN 10 XX 8765',
    muthuRecommendationText: 'Activate Automated Shrink Wrap Line 2.',
    muthuConfidence: 93,
    contractType: 'Supermarket Fast-Moving Restock',
    deliveryWindow: 'Today 06:00 PM',
    accountManager: 'Balaji Varma',
    shippingAddress: 'Krishna Distribution Center, Guntur Ring Road, Guntur, AP 522001',
    items: [
      { id: 'itm-9', name: 'Eco Bubble Wrap Rolls 100m', sku: 'SKU-PKG-1035', quantity: 22, unitPrice: 5090, binLocation: 'C-03-02-A' }
    ],
    estimatedCompletionTime: '01:05 PM'
  },
  {
    id: 'ORD-89132',
    orderNumber: '#132',
    orderCategory: 'individual',
    customerName: 'Priya Nair',
    customerType: 'Standard',
    orderValue: 15400,
    shippingType: 'Express',
    priority: 'Critical',
    orderDate: 'Today 10:00 AM',
    expectedDispatchTime: 'Today 01:30 PM',
    slaDeadline: '01:50 PM (98 mins left)',
    slaRemainingMinutes: 98,
    currentStatus: 'Picking',
    assignedPicker: 'Ravi Kumar',
    assignedPacker: 'Priya Sharma',
    warehouseZone: 'Zone A',
    itemCount: 4,
    isNearSlaRisk: true,
    slaRiskLevel: 'At Risk',
    slaRiskReason: 'One item located in High-Rack Aisle 12 requiring scissor lift.',
    assignedTruckId: 'TRK-HYD-06',
    assignedTruckNumber: 'AP 16 XX 3456',
    muthuRecommendationText: 'Queue item in Scissor Lift Wave 3 at 11:30 AM.',
    muthuConfidence: 92,
    deliveryMethod: 'Delhivery Express Ground',
    paymentStatus: 'Prepaid Verified',
    shippingAddress: '42/B, Gandhi Nagar, Kochi, Kerala 682020',
    items: [
      { id: 'itm-10', name: 'Noise-Cancelling Executive Headset', sku: 'SKU-ACC-1027', quantity: 4, unitPrice: 3850, binLocation: 'A-03-01-B' }
    ],
    estimatedCompletionTime: '01:15 PM'
  },

  // 117 ADDITIONAL BALANCED ORDERS (Total 125 Orders)
  ...Array.from({ length: 117 }, (_, index) => {
    const num = index + 133;
    const isB2B = index % 2 === 0;
    const b2bCompanies = [
      'Hyderabad Precision Tools', 'Deccan BioPharma Ltd', 'Zenith Retail Hyderabad',
      'Telangana Heavy Engineering', 'Vijayawada FMCG Hub', 'Guntur Agro Logistics',
      'Visakhapatnam Port Supplies', 'Chennai Enterprise Tech', 'Bengaluru Retail Grid',
      'Mumbai Central Hardware', 'Pune Auto Component Systems', 'Kolkata Industrial Spares'
    ];
    const b2cCustomers = [
      'Arjun Rao', 'Kavya Menon', 'Vikram Sethi', 'Sneha Iyer', 'Manoj Kulkarni',
      'Divya Patel', 'Rajesh Verma', 'Balaji Subramanian', 'Swathi Deshmukh',
      'Karthik Sundaram', 'Pooja Hegde', 'Aditya Singhania', 'Meera Joshi'
    ];

    const customerName = isB2B ? b2bCompanies[index % b2bCompanies.length] : b2cCustomers[index % b2cCustomers.length];
    
    // Status distribution: 18 New/Received, 10 Picking, 11 Packed, 8 Quality Check, 24 Dispatched, 47 Delivered
    let status: OrderStatus = 'Delivered';
    if (index < 16) {
      status = 'New';
    } else if (index < 24) {
      status = 'Picking';
    } else if (index < 33) {
      status = 'Packing';
    } else if (index < 40) {
      status = 'Quality Check';
    } else if (index < 46) {
      status = 'Ready for Dispatch';
    } else if (index < 70) {
      status = 'Dispatched';
    } else {
      status = 'Delivered';
    }

    const slaMins = status === 'Delivered' ? 0 : status === 'Dispatched' ? 180 + index * 10 : 300 + index * 15;
    const priority = computeOrderPriority(isB2B && index % 3 === 0 ? 'VIP' : 'Standard', index % 4 === 0 ? 'Express' : 'Standard', slaMins, isB2B ? 'business' : 'individual');

    return {
      id: `ORD-89${num}`,
      orderNumber: `#${num}`,
      orderCategory: isB2B ? 'business' as const : 'individual' as const,
      customerName,
      companyName: isB2B ? customerName : undefined,
      customerType: (isB2B && index % 3 === 0 ? 'VIP' : isB2B ? 'Business' : 'Standard') as CustomerType,
      orderValue: isB2B ? 35000 + (index * 3200) : 2500 + (index * 450),
      shippingType: (index % 4 === 0 ? 'Express' : index % 4 === 1 ? 'Standard' : 'Economy') as ShippingType,
      priority,
      orderDate: 'Today 08:30 AM',
      expectedDispatchTime: 'Today 04:00 PM',
      slaDeadline: 'Today 06:00 PM',
      slaRemainingMinutes: slaMins,
      currentStatus: status,
      assignedPicker: index % 2 === 0 ? 'Ravi Kumar' : 'Marcus Vance',
      assignedPacker: index % 2 === 0 ? 'Elena Rostova' : 'David Kim',
      warehouseZone: isB2B ? 'Zone C Bulk Pallets' : 'Zone A High-Density Shelves',
      itemCount: isB2B ? 12 + (index % 8) : 1 + (index % 4),
      isNearSlaRisk: false,
      slaRiskLevel: 'Safe' as const,
      assignedTruckNumber: isB2B ? (index % 3 === 0 ? 'AP 05 XX 1234' : 'TS 09 XX 5678') : 'AP 16 XX 3456',
      items: [
        { id: `itm-gen-${num}-1`, name: isB2B ? 'Heavy Corrugated Cartons (50pk)' : 'Wireless Optical Mouse Ergonomic', sku: isB2B ? 'SKU-PKG-1036' : 'SKU-ACC-1021', quantity: isB2B ? 10 : 1, unitPrice: isB2B ? 4200 : 1200, binLocation: 'B-02-01-A' }
      ],
      estimatedCompletionTime: '03:45 PM'
    };
  })
];
