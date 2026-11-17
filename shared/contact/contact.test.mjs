import test from 'node:test';
import assert from 'node:assert/strict';
import { ContactManager } from './contact.mjs';

test('ContactManager validation rejects empty fields and invalid email/phone', () => {
  const manager = new ContactManager();
  manager.setLanguage('vi');

  // Empty name
  assert.equal(manager.validate({ name: '', email: 'test@example.com', phone: '0912345678', message: 'Hello' }), 'Vui lòng nhập họ và tên của bạn.');

  // Invalid email
  assert.equal(manager.validate({ name: 'Hùng', email: 'invalid-email', phone: '0912345678', message: 'Hello' }), 'Vui lòng nhập địa chỉ email hợp lệ.');

  // Invalid phone (too short)
  assert.equal(manager.validate({ name: 'Hùng', email: 'hung@gmail.com', phone: '123', message: 'Hello' }), 'Vui lòng nhập số điện thoại hợp lệ.');

  // Empty message
  assert.equal(manager.validate({ name: 'Hùng', email: 'hung@gmail.com', phone: '0912345678', message: 'hi' }), 'Vui lòng nhập nội dung tin nhắn.');

  // Valid contact
  assert.equal(manager.validate({ name: 'Nguyễn Văn A', email: 'a@gmail.com', phone: '0912 345 678', message: 'Tôi cần liên hệ hợp tác làm video' }), null);
});

test('ContactManager bilingual switching updates error and action messages', () => {
  const manager = new ContactManager();

  manager.setLanguage('en');
  assert.equal(manager.validate({ name: '', email: 'test@example.com', phone: '0912345678', message: 'Hello' }), 'Please enter your full name.');
  assert.equal(manager.t.submitBtn, 'Send Contact Request');

  manager.setLanguage('vi');
  assert.equal(manager.validate({ name: '', email: 'test@example.com', phone: '0912345678', message: 'Hello' }), 'Vui lòng nhập họ và tên của bạn.');
  assert.equal(manager.t.submitBtn, 'Gửi thông tin liên hệ');
});
