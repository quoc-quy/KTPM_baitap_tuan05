package com.example.user.service;

import com.example.user.model.User;
import com.example.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username đã tồn tại!";
        }
        
        // --- LOGIC MỚI: Gán role mặc định nếu không được truyền vào ---
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER"); // Mặc định ai đăng ký cũng là USER
        }
        // --------------------------------------------------------------

        userRepository.save(user);
        return "Đăng ký thành công! (Quyền: " + user.getRole() + ")";
    }

    public String login(User loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginRequest.getPassword())) {
            // Trả về thêm thông tin role khi đăng nhập thành công
            return "Đăng nhập thành công! Quyền của bạn là: " + userOpt.get().getRole();
        }
        return null;
    }
}