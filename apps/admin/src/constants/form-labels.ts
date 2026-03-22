export const POI_FORM_LABELS = {
  VI: {
    // Page header
    createTitle: 'Đăng ký POI mới',
    createSubtitle: 'Nhập đầy đủ dữ liệu để đội ngũ duyệt và xuất bản cho khách du lịch.',
    editTitle: 'Chỉnh sửa POI',
    editSubtitle: 'Cập nhật thông tin POI.',
    viewTitle: 'Xem POI',
    viewSubtitle: 'Chi tiết thông tin POI.',

    // Content section
    contentHeading: 'Nội dung POI',
    poiName: 'Tên POI',
    required: '*',
    description: 'Mô tả',
    descriptionOptional: '(không bắt buộc)',
    namePlaceholder: 'ví dụ Quán bún mắm...',
    nameEnPlaceholder: 'Tên tiếng Anh (không bắt buộc)',
    descriptionPlaceholder: 'Mô tả trải nghiệm...',
    descriptionEnPlaceholder: 'Mô tả tiếng Anh (không bắt buộc)',

    // Classification
    classificationHeading: 'Phân loại & thông tin',
    category: 'Danh mục',
    address: 'Địa chỉ hiển thị',
    addressPlaceholder: 'Số nhà, đường, quận...',
    addressHint: 'Địa chỉ sẽ được chèn vào phần đầu mô tả.',

    // Location
    locationHeading: 'Vị trí bản đồ',
    latitude: 'Latitude',
    longitude: 'Longitude',
    triggerRadius: 'Bán kính kích hoạt',
    copyCoords: 'Copy toạ độ',
    openMap: 'Mở trên OpenStreetMap',

    // Media
    mediaHeading: 'Media Assets',
    imagesPending: 'Hình ảnh chờ tải lên',
    dropImages: 'Thả ảnh hoặc bấm để tải lên',
    imageLimit: 'PNG, JPG ≤ 5MB',
    audioGuide: 'Audio guide',
    uploadAudio: 'Tải lên audio',

    // TTS
    ttsHeading: 'Tự động tạo TTS từ mô tả',
    ttsDescription: 'Tự động tạo audio thuyết minh từ nội dung mô tả POI bằng Microsoft Edge TTS.',
    generateVi: 'Tạo audio VI',
    generateEn: 'Tạo audio EN',

    // Actions
    cancel: 'Huỷ',
    back: 'Quay lại',
    submit: 'Gửi duyệt POI',
    save: 'Lưu thay đổi',

    // Sidebar
    approvalStatus: 'Trạng thái phê duyệt',
    approvalNote: 'POI mới sẽ ở trạng thái <b>In review</b>. Bạn sẽ nhận thông báo khi team vận hành duyệt xong.',
    previewButton: 'Xem thử giao diện',
    tipsHeading: 'Mẹo',
    tips: [
      'Mô tả tiếng Việt tối thiểu 10 dòng để được duyệt nhanh.',
      'Ảnh đại diện nên sáng, độ phân giải 1200px.',
      'Audio nên dài 2-4 phút, ghi âm rõ ràng.',
    ],

    // Toasts
    toastMissingContent: 'Thiếu nội dung',
    toastMissingContentDesc: 'Vui lòng nhập tên và mô tả tiếng Việt trước khi xem preview.',
    toastMissingInfo: 'Thiếu thông tin',
    toastMissingInfoDesc: 'Tên và mô tả tiếng Việt là bắt buộc.',
    toastMissingCoords: 'Thiếu toạ độ',
    toastMissingCoordsDesc: 'Vui lòng chọn vị trí trên bản đồ.',
    toastSubmitted: 'Đã gửi POI để duyệt',
    toastSubmittedDesc: 'Chúng tôi sẽ thông báo khi POI được phê duyệt.',
    toastUpdated: 'Đã cập nhật POI',
    toastUpdatedDesc: 'Thông tin POI đã được lưu thành công.',
    toastFailed: 'Lưu POI thất bại',
    toastFailedDefault: 'Không thể tạo POI. Vui lòng thử lại.',
  },
  EN: {
    createTitle: 'Register New POI',
    createSubtitle: 'Fill in data for the review team to publish to tourists.',
    editTitle: 'Edit POI',
    editSubtitle: 'Update POI information.',
    viewTitle: 'View POI',
    viewSubtitle: 'POI detail information.',

    contentHeading: 'POI Content',
    poiName: 'POI Name',
    required: '*',
    description: 'Description',
    descriptionOptional: '(optional)',
    namePlaceholder: 'e.g. Bun Mam Restaurant...',
    nameEnPlaceholder: 'Optional English name',
    descriptionPlaceholder: 'Describe the experience...',
    descriptionEnPlaceholder: 'Optional English copy...',

    classificationHeading: 'Classification & Info',
    category: 'Category',
    address: 'Display Address',
    addressPlaceholder: 'Street number, road, district...',
    addressHint: 'Address will be prepended to the description.',

    locationHeading: 'Map Location',
    latitude: 'Latitude',
    longitude: 'Longitude',
    triggerRadius: 'Trigger Radius',
    copyCoords: 'Copy coords',
    openMap: 'Open on OpenStreetMap',

    mediaHeading: 'Media Assets',
    imagesPending: 'Images pending upload',
    dropImages: 'Drop images or click to upload',
    imageLimit: 'PNG, JPG ≤ 5MB',
    audioGuide: 'Audio guide',
    uploadAudio: 'Upload audio',

    ttsHeading: 'Auto-generate TTS from Description',
    ttsDescription: 'Automatically generate audio narration from POI description using Microsoft Edge TTS.',
    generateVi: 'Generate VI Audio',
    generateEn: 'Generate EN Audio',

    cancel: 'Cancel',
    back: 'Back',
    submit: 'Submit POI for Review',
    save: 'Save Changes',

    approvalStatus: 'Approval Status',
    approvalNote: 'New POIs start as <b>In review</b>. You will be notified once the ops team approves.',
    previewButton: 'Quick Preview',
    tipsHeading: 'Tips',
    tips: [
      'Vietnamese description of at least 10 lines gets faster approval.',
      'Cover image should be bright, at least 1200px.',
      'Audio should be 2-4 minutes, clearly recorded.',
    ],

    toastMissingContent: 'Missing Content',
    toastMissingContentDesc: 'Please enter Vietnamese name and description before preview.',
    toastMissingInfo: 'Missing Information',
    toastMissingInfoDesc: 'Vietnamese name and description are required.',
    toastMissingCoords: 'Missing Coordinates',
    toastMissingCoordsDesc: 'Please select a location on the map.',
    toastSubmitted: 'POI Submitted for Review',
    toastSubmittedDesc: 'We will notify you when the POI is approved.',
    toastUpdated: 'POI Updated',
    toastUpdatedDesc: 'POI information saved successfully.',
    toastFailed: 'Save POI Failed',
    toastFailedDefault: 'Could not create POI. Please try again.',
  },
} as const;

export type FormLabels = typeof POI_FORM_LABELS['VI'];
