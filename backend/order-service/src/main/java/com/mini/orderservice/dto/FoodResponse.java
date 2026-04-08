package com.mini.orderservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class FoodResponse {
    private String id;
    private String name;
    private double price;

    public String getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("_id")
    @SuppressWarnings("unchecked")
    public void setMongoId(Object mongoId) {
        if (mongoId == null) {
            return;
        }
        if (mongoId instanceof String mongoIdString) {
            this.id = mongoIdString;
            return;
        }
        if (mongoId instanceof Map<?, ?> mongoIdObject) {
            Object oid = ((Map<String, Object>) mongoIdObject).get("$oid");
            if (oid != null) {
                this.id = String.valueOf(oid);
            }
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

}
