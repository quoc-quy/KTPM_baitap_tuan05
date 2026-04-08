package com.mini.orderservice.service;

import com.mini.orderservice.dto.CreateOrderRequest;
import com.mini.orderservice.dto.FoodResponse;
import com.mini.orderservice.dto.UpdateOrderStatusRequest;
import com.mini.orderservice.dto.UserResponse;
import com.mini.orderservice.model.Order;
import com.mini.orderservice.model.OrderItem;
import com.mini.orderservice.model.OrderStatus;
import com.mini.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final String userServiceUrl;
    private final String foodServiceUrl;

    public OrderService(OrderRepository orderRepository,
                        RestTemplate restTemplate,
                        @Value("${services.user-service-url}") String userServiceUrl,
                        @Value("${services.food-service-url}") String foodServiceUrl) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
        this.foodServiceUrl = foodServiceUrl;
    }

    public Order create(CreateOrderRequest request) {
        UserResponse user = validateUser(request.getUserId());

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            FoodResponse food = getFood(itemReq.getFoodId());
            double lineTotal = food.getPrice() * itemReq.getQuantity();
            total += lineTotal;

            orderItems.add(new OrderItem(
                    food.getId(),
                    food.getName(),
                    itemReq.getQuantity(),
                    food.getPrice(),
                    lineTotal
            ));
        }

        Order order = new Order(
                user.getId(),
                user.getUsername(),
                orderItems,
                total,
                OrderStatus.PENDING,
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }

    public List<Order> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order updateStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = getById(orderId);
        order.setStatus(request.getStatus());
        return orderRepository.save(order);
    }

    public Order getById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private UserResponse validateUser(String userId) {
        try {
            return restTemplate.getForObject(userServiceUrl + "/users/" + userId, UserResponse.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid userId");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "User service unavailable");
        }
    }

    private FoodResponse getFood(String foodId) {
        try {
            FoodResponse food = restTemplate.getForObject(foodServiceUrl + "/foods/" + foodId, FoodResponse.class);
            if (food == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Food not found: " + foodId);
            }
            if (food.getId() == null || food.getId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid food data: missing food id");
            }
            return food;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Food not found: " + foodId);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Food service unavailable");
        }
    }
}
