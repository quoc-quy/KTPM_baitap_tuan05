package com.mini.orderservice.controller;

import com.mini.orderservice.dto.CreateOrderRequest;
import com.mini.orderservice.dto.UpdateOrderStatusRequest;
import com.mini.orderservice.model.Order;
import com.mini.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(request);
    }

    @GetMapping("/orders")
    public List<Order> getOrders() {
        return orderService.getAll();
    }

    @PatchMapping("/orders/{id}/status")
    public Order updateStatus(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request);
    }
}
