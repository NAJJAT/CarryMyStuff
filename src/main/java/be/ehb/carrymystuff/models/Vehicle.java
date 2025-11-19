package be.ehb.carrymystuff.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;          // van, car, truck
    private String description;   // “large van, good for furniture”
    private Integer capacityKg;   // how much weight
    private String city;
    private String licensePlate;

    private boolean active;       // visible in search

    @ManyToOne
    @JoinColumn(name = "helper_id")
    private User helper;          // owner of vehicle (role = HELPER)
}
