package be.ehb.carrymystuff.Repository;

import be.ehb.carrymystuff.models.Role;
import be.ehb.carrymystuff.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
}